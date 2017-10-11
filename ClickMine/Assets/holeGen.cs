using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class holeGen : MonoBehaviour {

	string seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
	int numClicks = 1;
	string seed2 = "0x78c701cf5f1354f3a2dc02f77ccdbd1b0b7181b4865b9ead9b05963e9357a95c";
	int numClicks2 = 5;
	string seed3 = "0x8edb34da54becceabd1cf638bb9b685a4b398b2a445845843762e41405e5edfd";
	int numClicks3 = 8;
	Object[] materials;

	// Use this for initialization
	void Start () {
		materials = Resources.FindObjectsOfTypeAll (typeof(Material));
		var dirt = GameObject.CreatePrimitive(PrimitiveType.Quad);
	}

	void ClickCycle (string seed) {
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
