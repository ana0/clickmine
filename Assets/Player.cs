using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Player : MonoBehaviour {

    private Vector3 speed = new Vector3(0, 0, -1f);

	// Use this for initialization
	void Start () {

	}
	
	// Update is called once per frame
	void Update () {
        this.transform.Translate(speed*Time.deltaTime);
	}
}
