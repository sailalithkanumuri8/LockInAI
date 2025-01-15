//
//  NotificationHandler.swift
//  LockinAi
//
//  Created by Rohan Godha on 1/14/25.
//

import SwiftUI
import UserNotifications

// Allows access to send notificatios
class NotificationHandler {
    // Asks permission to the user to send notifications
    func askPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { success, error in
            if success {
                print("Granted")
            } else if let error = error {
                print(error.localizedDescription)
            }
        }
    }
    
    // Sends the notification
    func sendNotification(date: Date, type: String, timeInterval: Double = 5, title: String, body: String) {
        var trigger: UNNotificationTrigger?
        
        if type == "date" {
            let dateComponents = Calendar.current.dateComponents([.day, .month, .year, .hour, .minute], from: date)
            
            trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
            
        } else if type == "time" {
            trigger = UNTimeIntervalNotificationTrigger(timeInterval: timeInterval, repeats: false)
        }
        
        let content = UNMutableNotificationContent()
        
        content.title = title
        content.body = body
        content.sound = UNNotificationSound.default
        
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        
        UNUserNotificationCenter.current().add(request)
    }
}
