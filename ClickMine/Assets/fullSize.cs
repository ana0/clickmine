using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class fullSize : MonoBehaviour {

	// Use this for initialization
	void Start () {
		var quadHeight = (Camera.main.orthographicSize + 1.0) * 2.0;
		var quadWidth = quadHeight * Screen.width / Screen.height;
		this.gameObject.transform.localScale = new Vector3((float)quadWidth, (float)quadHeight, 1f);
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
