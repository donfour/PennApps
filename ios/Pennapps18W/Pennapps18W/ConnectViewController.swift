//
//  ConnectViewController.swift
//  Pennapps18W
//
//  Created by Ari Cohn on 1/20/18.
//  Copyright © 2018 Ari Cohn. All rights reserved.
//

import UIKit
import SocketIO

class ConnectViewController: UIViewController, UITextFieldDelegate
{
    var tap: UITapGestureRecognizer!

    @IBOutlet weak var codeTextField: UITextField!
    
    @IBAction func playButtonPressed(_ sender: Any)
    {
        sendCode()
    }
    
    func sendCode()
    {
        let code = Int(codeTextField.text ?? "0") ?? 0
        
        print(code)
        SocketIOManager.sharedInstance.sendCode(code: code)
        
        codeTextField.text = ""
    }
    
    override func viewDidLoad()
    {
        super.viewDidLoad()

        SocketIOManager.sharedInstance.socket.on("codeAccepted") { (data, ack) in
            print("returned: \(data)")
            if data.count > 0
            {
                if let accepted = data[0] as? Bool
                {
                    print(accepted)
                    if accepted
                    {
                        let storyboard = UIStoryboard(name: "Main", bundle: nil)

                        let controllerVC = storyboard.instantiateViewController(withIdentifier: "controllerVC")

                        self.present(controllerVC, animated: true, completion: nil)
                    }
                    else
                    {
                        let alertController = UIAlertController(title: "Invalid Code", message: "The code you entered was not recognized. Please try again.", preferredStyle: .alert)
                        let okAction = UIAlertAction(title: "OK", style: .default, handler: nil)

                        alertController.addAction(okAction)

                        self.present(alertController, animated: true, completion: nil)
                    }
                }
                else
                {
                    print("error parsing data")
                }
            }
            else
            {
                print("no data returned")
            }
        }
        
        tap = UITapGestureRecognizer(target: self, action: #selector(ConnectViewController.dismissKeyboard))
        codeTextField.delegate = self
    }
    
    override func viewDidAppear(_ animated: Bool)
    {
        super.viewDidAppear(animated)
        
        AppUtility.lockOrientation(.portrait, andRotateTo: .portrait)
        
        // keyboard will show
        NotificationCenter.default.addObserver(self, selector: #selector(ConnectViewController.keyboardWillShow(_:)), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
        
        // keyboard will hide
        NotificationCenter.default.addObserver(self, selector: #selector(ConnectViewController.keyboardWillHide(_:)), name: NSNotification.Name.UIKeyboardWillHide, object: nil)
        
        SocketIOManager.sharedInstance.establishConnection()
    }

    override func didReceiveMemoryWarning()
    {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @objc func dismissKeyboard()
    {
        
        codeTextField.resignFirstResponder()
        
        view.endEditing(true)
        
    }
    
    @objc func keyboardWillShow(_ notification: Foundation.Notification)
    {
        
        view.addGestureRecognizer(tap)
        
    }
    
    @objc func keyboardWillHide(_ notification: Foundation.Notification)
    {
        
        view.removeGestureRecognizer(tap)
        
    }
    
    func textFieldShouldReturn(_ textField: UITextField) -> Bool
    {
        
        dismissKeyboard()
        
        sendCode()
        
        return false
        
    }

}
