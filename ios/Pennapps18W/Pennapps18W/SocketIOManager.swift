//
//  SocketIOManager.swift
//  Pennapps18W
//
//  Created by Ari Cohn on 1/20/18.
//  Copyright © 2018 Ari Cohn. All rights reserved.
//

import UIKit
import SocketIO
class SocketIOManager: NSObject
{
//    static let url = "http://10.251.65.160:3000"
//    static let url = "http://default-environment.jpypjm2r2p.us-east-2.elasticbeanstalk.com/"
    static let url = "http://spaceinvadertest.herokuapp.com"
    
    static let sharedInstance = SocketIOManager()
    
    var manager = SocketManager(socketURL: URL(string: url)!, config: [.log(false), .compress])
    
    var socket: SocketIOClient!
    
    var connected = false
    
    override init() {
        super.init()
        
        socket = manager.defaultSocket
        
        socket.on(clientEvent: .connect) { (data, ack) in
            self.connected = true
        }
        
        socket.on(clientEvent: .disconnect) { (data, ack) in
            self.connected = false
        }
    }
    
    func establishConnection() {
        if (!connected)
        {
            socket.connect()
            connected = true
        }
    }
    
    func closeConnection() {
        socket.disconnect()
        connected = false
    }
    
    func sendCode(code: Int)
    {
        socket.emit("sendCode", code)
    }
    
    func sendAction(action: String)
    {
        socket.emit("sendAction", action)
    }

}
