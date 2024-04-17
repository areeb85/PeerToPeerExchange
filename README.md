# Peer-to-Peer Book Exchange Platform

## Overview
The Peer-to-Peer (P2P) Book Exchange Platform is a community-driven web application designed to facilitate the exchange of physical books. Users can list books they no longer need, search for books available on the platform, and request exchanges, leveraging a priority-based queuing system. This project focuses on sustainability and encourages sharing within a reading community.

## Features

- **User Profiles**: Users can create and manage their profiles, which include their book listings and personal reading interests.
- **Book Listings**: Users can list books they wish to exchange, providing details such as title, author, genre, and a summary.
- **Advanced Search**: Implements a Fuse.js based search for book titles, enabling fuzzy search capabilities that help users find books even with partial or slightly incorrect queries.
- **Priority Queue System**: The exchange mechanism is governed by a priority queue. Users gain points by listing books and spending time on the platform. These points influence their priority in the queue for book requests.
- **Dynamic Notifications**: Users receive notifications when their books are requested or when they are next in line to receive a book, ensuring they are always updated on the status of their exchanges.

## Technologies

- **React.js**: Used for building the front-end user interface.
- **PostgreSQL**: The backend database that stores user and book information.
- **Supabase**: An open-source Firebase alternative that provides backend services, such as real-time databases and authentication, used to manage user interactions and data storage.
- **Fuse.js**: Integrated for fuzzy search functionality, enhancing the search experience by allowing flexibility in user queries.
- **Firebase**: Used only for hosting the web app - https://peertopeerareeb.web.app

## How It Works

1. **User Registration**: Users register on the platform and set up their profiles.
2. **Book Listing**: Users list their books with necessary details.
3. **Book Requests**: Users search and request books. Requests are placed in a priority queue based on the user's accumulated points and active time spent on the platform.
4. **Book Exchange**: When a user decides to pass on a book, the system checks for the next eligible user in the priority queue and facilitates the exchange by notifying the current owner of the book. Once the owner is done reading the book, they can approve the request and transfer the ownership to the next eligible user.
5. **Notification System**: Ensures users are informed when it is their turn to receive a book or when someone requests one of their books.

## Prioritization Algorithm
The platform uses a combined score of user points (earned by posting books) and active time spent on the platform to prioritize book requests. Here’s how it works:

### Points System
- **Earning Points**: Users earn points each time they post a book to the platform. Each book posted contributes one point to the user's score.

### Active Time Tracking
- **Activity Monitoring**: The system tracks user interaction with various elements such as buttons, the navigation bar, and other triggerable functions.
- **Recording Active Time**: Active time is stored in the `users_table` and is updated in real-time as users interact with the platform.

### Request Prioritization
- **Fetching Requests**: Requests are fetched along with user points and active time from the database.
- **Normalization**: Both points and active time are normalized to ensure they contribute fairly to the priority score.
- **Priority Calculation**: A combined score is calculated for each request, helping sort the requests queue effectively.


## Future Works

While the current version of the Peer-to-Peer Book Exchange Platform offers a functional and interactive way for users to exchange books, there are several areas identified for future improvements:

1. **Testing**: Currently, the platform lacks comprehensive automated tests. Future development will include the implementation of unit and integration tests to ensure code reliability and facilitate easier updates and refactoring.

2. **Environment Variables for API Keys**: API keys and sensitive credentials are currently not stored securely. Moving forward, these will be managed via environment variables to enhance security and conform with best practices in software development.

3. **AI-Driven Features**:
   - **Book Recommendations**: Integrate machine learning to analyze user preferences and reading habits to offer personalized book recommendations.
   - **Smart Search**: Implement AI-enhanced search algorithms to improve search results and efficiency, possibly extending to semantic search capabilities.
   - **Automated Book Matching**: Develop an AI system that can automatically suggest potential book exchanges based on user interests and book availability.

4. **User Experience Enhancements**:
   - **Responsive Design**: Improve the responsiveness of the web application to ensure it is fully functional on devices of all sizes.
   - **User Interface Improvements**: Continuously update the user interface to make it more intuitive and user-friendly based on user feedback.

5. **Security Enhancements**:
   - **OAuth Integration**: Implement OAuth for more secure and versatile user authentication.
   - **Data Encryption**: Enhance data security by encrypting sensitive user data stored in the database.

These improvements aim to make the Peer-to-Peer Book Exchange Platform more robust, secure, and user-friendly, enhancing the overall user experience and platform reliability.



