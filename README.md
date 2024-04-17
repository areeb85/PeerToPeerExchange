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

## How It Works

1. **User Registration**: Users register on the platform and set up their profiles.
2. **Book Listing**: Users list their books with necessary details.
3. **Book Requests**: Users search and request books. Requests are placed in a priority queue based on the user's accumulated points and active time spent on the platform.
4. **Book Exchange**: When a user decides to pass on a book, the system checks for the next eligible user in the priority queue and facilitates the exchange by notifying both parties.
5. **Notification System**: Ensures users are informed when it is their turn to receive a book or when someone requests one of their books.
