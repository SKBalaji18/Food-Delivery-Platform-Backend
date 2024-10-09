# Food Delivery Platform Backend

## Objective
This project is a backend system for a food delivery platform, similar to "Zomato." It includes user management, restaurant and menu management, order placement, and real-time order tracking.

## Tech Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB (NoSQL)
- **Language**: JavaScript
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: WebSockets

## Features
### User Management
- **Register User**: Create a new user account.
- **Login**: Authenticate users and return a JWT.
- **Update Profile**: Allow users to update their profile information.
- **Get Profile**: Retrieve user profile details.

### Restaurant & Menu Management
- **Create Restaurant**: Add a new restaurant.
- **Update Restaurant**: Modify existing restaurant details.
- **Manage Menu Items**: Add or update menu items for each restaurant.

### Order Placement
- **Place Order**: Users can place an order by selecting items from a restaurant’s menu.
- **Get Order Details**: Retrieve the details of a specific order.
- **Update Order Status**: Change the status of an order (e.g., Pending, Confirmed).
- **List User Orders**: Get all orders placed by the logged-in user.

### Real-time Order Tracking
- **Track Order**: Get the current status of an order.
- **WebSockets**: Real-time notifications for order status changes.

## API Endpoints

### User Management
- **POST** `/register`
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "password": "securepassword",
      "phone": "1234567890"
    }
    ```
- **POST** `/login`
  - **Request Body**:
    ```json
    {
      "email": "john@example.com",
      "password": "securepassword"
    }
    ```
- **GET** `/profile` (Requires Auth)
- **PUT** `/profile` (Requires Auth)
  - **Request Body**:
    ```json
    {
      "name": "John Doe",
      "phone": "0987654321",
      "addresses": ["123 Elm St, Cityville"]
    }
    ```

### Restaurant Management
- **POST** `/restaurants` (Requires Auth)
  - **Request Body**:
    ```json
    {
      "name": "Best Restaurant",
      "location": "City Center"
    }
    ```
- **PUT** `/restaurants/{restaurantId}` (Requires Auth)
- **POST** `/restaurants/{restaurantId}/menu` (Requires Auth)
  - **Request Body**:
    ```json
    {
      "name": "Pizza Margherita",
      "description": "Classic pizza with fresh mozzarella",
      "price": 12.99,
      "availability": true
    }
    ```
- **PUT** `/restaurants/{restaurantId}/menu/{itemId}` (Requires Auth)

### Order Management
- **POST** `/orders` (Requires Auth)
  - **Request Body**:
    ```json
    {
      "items": [
        {
          "itemId": "60c72b2f9b1d4c001f5c3f4b",
          "name": "Pad Thai",
          "price": 10.99,
          "quantity": 2
        }
      ],
      "deliveryAddress": "123 Elm St, Apt 5, Cityville",
      "estimatedDeliveryTime": "2024-10-09T14:00:00Z"
    }
    ```
- **GET** `/orders/{orderId}` (Requires Auth)
- **GET** `/orders` (Requires Auth)
- **PUT** `/orders/{orderId}/status` (Requires Auth)

### Real-time Order Tracking
- **GET** `/orders/{orderId}/track` (Requires Auth)

## Getting Started

### Prerequisites
- Node.js
- MongoDB (or any NoSQL database of your choice)
- Postman (for testing the APIs)

### Testing the API
You can use Postman to test the API endpoints. Make sure to include the JWT token in the Authorization header for endpoints that require authentication.

## Error Handling
The API returns appropriate status codes and error messages for invalid requests, unauthorized access, and server errors.

## Contribution
Feel free to contribute by submitting a pull request or opening an issue for any bugs or feature requests.

## License
This project is licensed under the MIT License.

---

Make sure to customize the repository link, JWT secret, and MongoDB connection string to match your setup! Let me know if you need any adjustments.