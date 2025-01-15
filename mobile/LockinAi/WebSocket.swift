//
//  WebSocket.swift
//  LockinAi
//
//  Created by Rohan Godha on 1/12/25.
//

import SwiftUI
import Foundation
import UserNotifications

// Message structs for WebSocket communication
struct SendMessage: Codable {
    let type: String
    let code: String
    
    init(code: String) {
        self.type = "send_code"
        self.code = code
    }
}

struct ReceiveMessage: Codable {
    let type: String
}

class WebSocketManager: ObservableObject {
    private var webSocketTask: URLSessionWebSocketTask?
    @Published var messages: [String] = []
    @Published var isConnected = false
    private let notificationHandler = NotificationHandler()
    
    init() {
        // Ask for notification permissions during initialization
        notificationHandler.askPermission()
    }
    
    func connect(to url: String) {
        guard let url = URL(string: url) else {
            print("Invalid URL")
            return
        }
        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        receiveMessage()
    }
    
    func send(_ code: String) {
        let sendMessage = SendMessage(code: code)
        
        guard let jsonData = try? JSONEncoder().encode(sendMessage),
              let jsonString = String(data: jsonData, encoding: .utf8) else {
            print("Failed to encode message to JSON")
            return
        }
        
        print("Sending JSON: \(jsonString)")
        
        let message = URLSessionWebSocketTask.Message.string(jsonString)
        webSocketTask?.send(message) { [weak self] error in
            if let error = error {
                print("WebSocket sending error: \(error)")
            } else {
                DispatchQueue.main.async {
                    self?.isConnected = true
                }
            }
        }
    }
    
    private func showNotification() {
        print("Scheduling notification using NotificationHandler...")
        notificationHandler.sendNotification(
            date: Date(),
            type: "time",
            timeInterval: 5,
            title: "Focus Reminder",
            body: "Hey! Let's get back to work!"
        )
    }
    
    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    print("Received text: \(text)")
                    
                    if let data = text.data(using: .utf8),
                       let decodedMessage = try? JSONDecoder().decode(ReceiveMessage.self, from: data) {
                        DispatchQueue.main.async {
                            switch decodedMessage.type {
                            case "request_code":
                                print("Server requested code")
                            case "looked_away":
                                print("User looked away - triggering notification")
                                self?.showNotification()
                            default:
                                print("Unknown message type: \(decodedMessage.type)")
                            }
                        }
                    } else {
                        print("Failed to decode received message: \(text)")
                    }
                case .data(let data):
                    if let decodedMessage = try? JSONDecoder().decode(ReceiveMessage.self, from: data) {
                        print("Received message type: \(decodedMessage.type)")
                    } else {
                        print("Failed to decode received data")
                    }
                @unknown default:
                    break
                }
                self?.receiveMessage()
            case .failure(let error):
                print("WebSocket receiving error: \(error)")
                DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                    self?.receiveMessage()
                }
            }
        }
    }
    
    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        isConnected = false
    }
}
