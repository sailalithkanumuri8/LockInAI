//
//  WebSocket.swift
//  LockinAi
//
//  Created by Rohan Godha on 1/12/25.
//

import SwiftUI
import Foundation
import UserNotifications

// Separate structs for sending and receiving messages
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
    
    init() {
        // Request notification permissions when the manager is initialized
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if granted {
                print("Notification permission granted")
            } else if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }
    
    func connect(to url: String) {
        guard let url = URL(string: url) else { return }
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
        webSocketTask?.send(message) { error in
            if let error = error {
                print("WebSocket sending error: \(error)")
            }
        }
    }
    
    private func showNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Focus Reminder"
        content.body = "Hey! Let's get back to work!"
        content.sound = .default
        
        // Create an immediate trigger
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        
        // Create the request
        let request = UNNotificationRequest(identifier: UUID().uuidString,
                                          content: content,
                                          trigger: trigger)
        
        // Add the request to the notification center
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Notification error: \(error)")
            }
        }
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
                            // Handle different message types
                            switch decodedMessage.type {
                            case "request_code":
                                print("Server requested code")
                            case "looked_away":
                                print("User looked away - sending notification")
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
    }
}
