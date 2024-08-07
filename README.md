# User Management Information System (UMIS) - Node.js Server

## Overview

The Node.js server for the User Management Information System (UMIS) provides real-time updates of data through socket communication. It acts as a bridge between the Laravel API and the client-side React application. By leveraging WebSockets, this server ensures that data changes are reflected instantly in the client application, enhancing the user experience with real-time interactions.

## Branching Strategy

This repository follows a structured branching strategy to ensure stability in the `main` branch while allowing for thorough testing and development.

### Branches

- **main**: The production branch. Code in this branch is considered stable and ready for deployment.
- **staging**: The pre-production branch. This branch is used for final testing before code is merged into the `main` branch. Code in this branch should be stable and as close to production-ready as possible.
- **development**: The integration branch for combining features and bug fixes before they are moved to the `staging` branch.
- **feature/feature-name**: Branches for individual features or bug fixes. These are merged into the `development` branch (or directly into `staging` if you skip the `development` branch).

### Workflow

1. **Feature Development**: Create a new branch from `development` (or `staging`) for each feature or bug fix.
    ```sh
    git checkout -b feature/feature-name development
    ```

2. **Feature Completion**: Once the feature or bug fix is complete and tested locally, merge it back into the `development` branch.
    ```sh
    git checkout development
    git merge feature/feature-name
    git branch -d feature/feature-name
    ```

3. **Integration Testing**: After all features and bug fixes are integrated into the `development` branch, perform integration testing.

4. **Staging**: When the `development` branch is stable and all tests pass, merge it into the `staging` branch for final pre-production testing.
    ```sh
    git checkout staging
    git merge development
    ```

5. **Production Deployment**: After successful testing in the `staging` branch, merge the `staging` branch into the `main` branch for production deployment.
    ```sh
    git checkout main
    git merge staging
    ```

## Getting Started

To set up the Node.js server, follow these steps:

### Requirements

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 14 or higher)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/) (package manager)

### Setup Process

1. **Clone the Project**: Clone the repository to your local machine.
    ```sh
    git clone https://github.com/yourusername/your-repo-name.git
    cd your-repo-name
    ```

2. **Install Dependencies**: Use npm or Yarn to install the necessary packages.
    ```sh
    npm install
    ```
    or
    ```sh
    yarn install
    ```

3. **Environment Configuration**:
    - Create a `.env` file in the root directory.
    - Add the necessary environment variables, such as API endpoints and WebSocket configuration.
    ```env
    API_URL=http://localhost:8000/api
    SOCKET_PORT=3000
    ```

4. **Start the Server**: Run the Node.js server.
    ```sh
    npm start
    ```
    or
    ```sh
    yarn start
    ```

## Features

- **Real-Time Data Updates**: Connects to the Laravel API to receive real-time updates and emits these updates to connected clients via WebSocket.
- **Socket Communication**: Facilitates bidirectional communication between the server and client for instant data updates.

## Folder Structure

- `src/`: Contains the source code for the application.
  - `config/`: Configuration files for the server.
  - `controllers/`: Logic for handling WebSocket connections and communication.
  - `services/`: Service modules for connecting to the Laravel API.
  - `index.js`: Entry point of the application.

## Adding New Features

1. **Add New Services**: Update the `src/services/` directory to include new logic for interacting with the Laravel API.
2. **Update WebSocket Handlers**: Modify the `src/controllers/` directory to handle new types of WebSocket messages and events.

## Contributing

In terms of the current setup, contributions are limited to the development team working on the UMIS project. Please reach out to the team lead for any changes or additions.

## License

A license will be attached here if the company plans to publish this Node.js server for ownership.

## Contact

For support or questions, you can contact the company via email at [ciis.zcmc@gmail.com](mailto:ciis.zcmc@gmail.com).
