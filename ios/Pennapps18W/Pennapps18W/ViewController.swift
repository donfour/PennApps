//
//  ViewController.swift
//  Pennapps18W
//
//  Created by Ari Cohn on 1/19/18.
//  Copyright © 2018 Ari Cohn. All rights reserved.
//

import UIKit
import CoreMotion
import AudioToolbox

class ViewController: UIViewController
{
    let manager = CMMotionManager()
    
    var tap: UITapGestureRecognizer!
    
    var isLandscapeRight = true
    
    @IBOutlet weak var innerView: UIView!
    
    @IBAction func powerButtonPressed(_ sender: Any)
    {
        let confirmAlert = UIAlertController(title: "Disconnect?", message: "Disconnecting will lose all progress and close the game", preferredStyle: .alert)
        
        confirmAlert.addAction(UIAlertAction(title: "Disconnect", style: .default, handler: { (action: UIAlertAction!) in
        
            SocketIOManager.sharedInstance.closeConnection()
            
        }))
        
        confirmAlert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        self.present(confirmAlert, animated: true, completion: nil)
    }
    
    override func viewDidLoad()
    {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        manager.startAccelerometerUpdates()
        manager.accelerometerUpdateInterval = 0.05
        manager.startAccelerometerUpdates(to: .main) {
            (data, error) in
            
            if let err = error
            {
                print(err)
            }
            else
            {
                let dy = data?.acceleration.y ?? 0
                
                if (dy < -0.1)
                {
                    let action = self.isLandscapeRight ? "left" : "right"
                    SocketIOManager.sharedInstance.sendAction(action: action)
                }
                else if (dy > 0.1)
                {
                    let action = self.isLandscapeRight ? "right" : "left"
                    SocketIOManager.sharedInstance.sendAction(action: action)
                }
            }
        }
        
        SocketIOManager.sharedInstance.socket.on("sendAction") { (data, ack) in
        
            if data.count > 0
            {
                if let dat = data[0] as? String
                {
                    if dat == "vibrate"
                    {
                        AudioServicesPlayAlertSound(SystemSoundID(kSystemSoundID_Vibrate))
                    }
                }
            }
            
        }
        
        SocketIOManager.sharedInstance.socket.on("computerDisconnected") { (data, ack) in
            
            let alertController = UIAlertController(title: "Game Disconnected", message: "You have been disconnected from the game.", preferredStyle: .alert)
            let okAction = UIAlertAction(title: "OK", style: .default, handler: { (action) in
                
                self.dismiss(animated: true, completion: nil)
                
            })
            
            alertController.addAction(okAction)
            
            self.present(alertController, animated: true, completion: nil)
            
        }
        
        SocketIOManager.sharedInstance.socket.on(clientEvent: .disconnect) {data, ack in
            
            let alertController = UIAlertController(title: "Game Disconnected", message: "You have been disconnected from the game.", preferredStyle: .alert)
            let okAction = UIAlertAction(title: "OK", style: .default, handler: { (action) in
                
                self.dismiss(animated: true, completion: nil)
                
            })
            
            alertController.addAction(okAction)
            
            self.present(alertController, animated: true, completion: nil)
            
        }

        
        tap = UITapGestureRecognizer(target: self, action: #selector(ViewController.shoot))
        view.addGestureRecognizer(tap)
        
        innerView.layer.cornerRadius = 10.0
        
    }
    
    override func viewDidAppear(_ animated: Bool)
    {
        super.viewDidAppear(animated)
        
        AppUtility.lockOrientation(.landscape, andRotateTo: .landscapeRight)
    }

    override func didReceiveMemoryWarning()
    {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @objc func shoot()
    {
        SocketIOManager.sharedInstance.sendAction(action: "shoot")
        print("shoot")
    }
    
    override func viewWillTransition(to size: CGSize, with coordinator: UIViewControllerTransitionCoordinator)
    {
        if UIDevice.current.orientation == UIDeviceOrientation.landscapeLeft
        {
            isLandscapeRight = false
        }
        else if UIDevice.current.orientation == UIDeviceOrientation.landscapeRight
        {
            isLandscapeRight = true
        }
    }


}

