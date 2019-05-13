
This is a sample app showing how to share one service in the background to servce multiple concurrent jobs

# Goal

	- Using one service function as multi-thread workers

# Key Features

	- Starting a service in the background to serve multiple compression jobs

	- Service is implemented as pure function hence could be easily scale out (having multiple instances running at the same time)

	- Showing each of the job could have it status updated without causing the whole app to re-render

	- Each job could be cancelled/paused/resumed without affecting other jobs

