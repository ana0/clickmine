using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class fullSize : MonoBehaviour {
	
	public GameObject holeGenerator;
	public holeGen hole;

	void SetFullScreen () {
		var quadHeight = (Camera.main.orthographicSize + 1.0) * 2.0;
		var quadWidth = quadHeight * Screen.width / Screen.height;
		this.gameObject.transform.localScale = new Vector3((float)quadWidth, (float)quadHeight, 1f);
	}

	// Use this for initialization
	void Start () {
		SetFullScreen ();
		holeGenerator = GameObject.FindGameObjectWithTag ("holeGenerator");
		hole = holeGenerator.GetComponent<holeGen> ();
		Debug.Log (hole);
		//Renderer renderer = GetComponent<Renderer>();
		//renderer.enabled = false;
		//Material mat = renderer.material;
		//Debug.Log(mat.GetTexture ("_MainTex"));

	}

	void OnMouseOver ()	{
		//If your mouse hovers over the GameObject with the script attached, output this message
		if (Input.GetMouseButtonDown (0)) {
			//Debug.Log("Mouse click.");
			hole.click ();
	
		}
	}

	// Update is called once per frame
	void Update () {
		
	}
}
