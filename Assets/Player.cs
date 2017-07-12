using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour {

    public static float speed = -1f;
    public float momentum = 1f;
    private Vector3 movement;
    Rigidbody playerRigidbody;

    // Use this for initialization
    void Awake () {
        playerRigidbody = GetComponent<Rigidbody>();
    }
	
	// Update is called once per frame
	void Update () {
        //this.transform.Translate(new Vector3(0f, 0f, speed) * Time.deltaTime);
	}

    void FixedUpdate()
    {
        float h = Input.GetAxisRaw("Horizontal");
        float v = Input.GetAxisRaw("Vertical");
        Move(h, v);
    }

    public void Move(float h, float v)
    {
        //Set movement vector from keyboard input, speed is our constant forward float
        movement.Set(-h, v, 0f);
        movement = movement * momentum;
        Vector3 constantSpeed = new Vector3(0f, 0f, speed);
        movement = movement + constantSpeed;
        //Add movement vector to the player's current transform
        playerRigidbody.MovePosition(transform.position + movement);
		Debug.Log(movement);
		//playerRigidbody.AddForce(movement, ForceMode.Acceleration);
	}


}
