require 'aws-sdk-sqs'
require 'ostruct'
require_relative '../models/tasks'

module RubyOpenAI
  # set up for the random task queue
  class RandomQueue
    TASK_TYPES = %w[CREATIVE PRACTICAL].freeze
    attr_reader :mock_mode

    def initialize(config)
      @config = config
      @mock_mode = config.USE_MOCK_SQS == 'true' || config.USE_MOCK_SQS == true
      @mock_tasks = []

      return if @mock_mode

      begin
        @sqs = Aws::SQS::Client.new(
          access_key_id: config.AWS_SQS_ACCESS_KEY_ID,
          secret_access_key: config.AWS_SQS_SECRET_ACCESS_KEY,
          region: config.AWS_REGION
        )
        @queue = Aws::SQS::Queue.new(url: config.AWS_SQS_URL, client: @sqs)
        @attributes = @sqs.get_queue_attributes(
          queue_url: config.AWS_SQS_URL,
          attribute_names: ['All']
        )
        @url = config.AWS_SQS_URL
      rescue StandardError => e
        puts "⚠️  AWS SQS connection failed: #{e.message}"
        puts "🔄 Falling back to Mock mode"
        @mock_mode = true
        @mock_tasks = []
      end
    end

    def random_task
      return mock_random_task if @mock_mode

      fill_task(10) if queue_size.to_i <= 2
      task = @queue.receive_messages({
                                       max_number_of_messages: 1,
                                       receive_request_attempt_id: 'String'
                                     })
      if task.first.nil?
        fill_task(10)
        if Random.rand(0..1) < 0.5
          return { message_id: 'mock', receipt_handle: 'mock',
                   task_name: TASK_TYPES[0] }.to_json
        end
        return { message_id: 'mock', receipt_handle: 'mock', task_name: TASK_TYPES[1] }.to_json

      end
      { message_id: task.first.data.message_id, receipt_handle:      task.first.data.receipt_handle,
        task_name: JSON.parse(task.first.data.body)['task'] }.to_json
    rescue Aws::SQS::Errors::ReceiptHandleIsInvalid
      raise ArgumentError, "Input receipt \"#{task}\" is not a valid receipt"
    rescue StandardError => e
      puts "⚠️  Error fetching task from SQS: #{e.message}"
      puts "🔄 Returning mock task"
      mock_random_task
    end

    def finish_task(task)
      return mock_finish_task(task) if @mock_mode

      @queue.delete_messages(
        entries: [
          {
            id: task.message_id,
            receipt_handle: task.receipt_handle
          }
        ]
      )
    rescue Aws::SQS::Errors::ReceiptHandleIsInvalid
      puts "⚠️  Invalid receipt handle: #{task.receipt_handle}"
      puts "🔄 Mock mode: Task marked as finished"
      return true
    rescue StandardError => e
      puts "⚠️  Error deleting task from SQS: #{e.message}"
      puts "🔄 Mock mode: Task marked as finished"
      return true
    end

    def fill_task(num_of_task = 400)
      return mock_fill_task(num_of_task) if @mock_mode

      (1..num_of_task).each do |i|
        @queue.send_message(queue_url: @queue, message_body: { task: i.even? ? TASK_TYPES[0] : TASK_TYPES[1] }.to_json)
      end
    rescue StandardError => e
      puts "⚠️  Error filling tasks: #{e.message}"
      mock_fill_task(num_of_task)
    end

    def fill_task_imbalance(taskdata)
      return mock_fill_task_imbalance(taskdata) if @mock_mode

      task_arr = []
      # print('task data:', taskdata)
      TASK_TYPES.each do |task|
        # print('task:', task)
        num_of_task = taskdata[task].to_i
        # print('num_of_task:', num_of_task)
        (1..num_of_task).each do |_num|
          # print('task:', task, num)
          task_arr.push(task)
        end
      end
      task_arr.shuffle!
      print('task_arr:', task_arr)
      # for i in task_arr do
      #   @queue.send_message(queue_url: @queue,
      #                       message_body: { task: i }.to_json)
      # end
      (1..task_arr.length).each do |i|
        @queue.send_message(queue_url: @queue,
                            message_body: { task: task_arr[i] }.to_json)
      end
    rescue StandardError => e
      puts "⚠️  Error filling imbalanced tasks: #{e.message}"
      mock_fill_task_imbalance(taskdata)
    end

    def clear_queue
      return mock_clear_queue if @mock_mode

      @sqs.purge_queue(queue_url: @url)
    rescue StandardError => e
      puts "⚠️  Error clearing queue: #{e.message}"
      mock_clear_queue
    end

    def queue_size
      return @mock_tasks.size if @mock_mode

      @attributes.attributes['ApproximateNumberOfMessages']
    rescue StandardError => e
      puts "⚠️  Error getting queue size: #{e.message}"
      @mock_tasks.size
    end

    def queue_attributes
      return mock_queue_attributes if @mock_mode

      @attributes = @sqs.get_queue_attributes(
        queue_url: @url,
        attribute_names: ['All']
      )
      @attributes
    rescue StandardError => e
      puts "⚠️  Error getting queue attributes: #{e.message}"
      mock_queue_attributes
    end

    private

    # Mock methods for development without AWS
    def mock_random_task
      mock_fill_task(10) if @mock_tasks.size <= 2

      if @mock_tasks.empty?
        task_name = Random.rand(0..1) < 0.5 ? TASK_TYPES[0] : TASK_TYPES[1]
      else
        task_data = @mock_tasks.shift
        task_name = task_data[:task_name]
      end

      {
        message_id: "mock_#{SecureRandom.uuid}",
        receipt_handle: "mock_#{SecureRandom.uuid}",
        task_name: task_name
      }.to_json
    end

    def mock_finish_task(task)
      puts "✅ Mock mode: Task #{task.message_id} marked as finished"
      true
    end

    def mock_fill_task(num_of_task = 400)
      (1..num_of_task).each do |i|
        @mock_tasks << {
          message_id: "mock_#{SecureRandom.uuid}",
          receipt_handle: "mock_#{SecureRandom.uuid}",
          task_name: i.even? ? TASK_TYPES[0] : TASK_TYPES[1]
        }
      end
      puts "✅ Mock mode: Filled #{num_of_task} tasks (total: #{@mock_tasks.size})"
    end

    def mock_fill_task_imbalance(taskdata)
      task_arr = []
      TASK_TYPES.each do |task|
        num_of_task = taskdata[task].to_i
        (1..num_of_task).each do |_num|
          task_arr.push(task)
        end
      end
      task_arr.shuffle!

      task_arr.each do |task_name|
        @mock_tasks << {
          message_id: "mock_#{SecureRandom.uuid}",
          receipt_handle: "mock_#{SecureRandom.uuid}",
          task_name: task_name
        }
      end
      puts "✅ Mock mode: Filled #{task_arr.length} imbalanced tasks (total: #{@mock_tasks.size})"
    end

    def mock_clear_queue
      @mock_tasks = []
      puts "✅ Mock mode: Queue cleared"
    end

    def mock_queue_attributes
      OpenStruct.new(
        attributes: {
          'ApproximateNumberOfMessages' => @mock_tasks.size.to_s,
          'ApproximateNumberOfMessagesNotVisible' => '0',
          'ApproximateNumberOfMessagesDelayed' => '0'
        }
      )
    end
  end
end
