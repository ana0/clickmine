using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Runtime.InteropServices;

public class holeGen : MonoBehaviour {

	string seed = "0x5d52bc658e15e9cade11cc73503f3e083988d38c9fa42806caf40c353368ff4e";
	public int numClicks = 0;
	string seed2 = "0x78c701cf5f1354f3a2dc02f77ccdbd1b0b7181b4865b9ead9b05963e9357a95c";
	public int numClicks2 = 3;
	string seed3 = "0x8edb34da54becceabd1cf638bb9b685a4b398b2a445845843762e41405e5edfd";
	public int numClicks3 = 6;
	List<GameObject> dirtLayers = new List<GameObject>();

	[DllImport("__Internal")]
	private static extern void Hello();


	void Start () {
		// fetch Player info from chain here
		randomFromSeed(seed);
		//Debug.Log (numClicks);
		//clickCycle ();
		Hello ();
	}

	Texture GetTexture(string nameType, int identifier) {
		// load a texture with a name like "Rock1" or "Mask6"
		Texture tex = Resources.Load ("Textures/" + nameType + identifier) as Texture;
		Debug.Log ("Textures/" + nameType + identifier);
		return tex;
	}

	Material MakeMaterial (Texture mask, Texture ground) {
		// makes a new material to hole specifications
		Material mat = new Material(Shader.Find("Standard"));
		mat.SetTexture ("_MainTex", mask); // should be the mask
		mat.SetFloat ("_Mode", 1);
		mat.SetColor ("_Color", Color.gray);
		mat.SetTexture ("_DetailAlbedoMap", ground); 
		mat.EnableKeyword("_DETAIL_MULX2");
		mat.EnableKeyword("_ALPHATEST_ON");
		mat.DisableKeyword("_ALPHABLEND_ON");
		mat.DisableKeyword("_ALPHAPREMULTIPLY_ON");
		mat.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.One);
		mat.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.Zero);
		mat.SetInt("_ZWrite", 1);
		mat.renderQueue = 2450;
		return mat;
	}

	GameObject genQuad (Texture maskTex, Texture dirtTex, int zIndex) {
		// generates a fullsize quad using materials given
		var q = GameObject.CreatePrimitive(PrimitiveType.Quad);
		var quadHeight = (Camera.main.orthographicSize + 1.0) * 2.0;
		var quadWidth = quadHeight * Screen.width / Screen.height;
		q.transform.localScale = new Vector3((float)quadWidth, (float)quadHeight, 1f);
		Debug.Log ("Generating at " + zIndex);
		Vector3 temp = new Vector3(0, 0, zIndex);
		q.transform.position = temp;
		Material dirtMaterial = MakeMaterial (maskTex, dirtTex);
		q.GetComponent<Renderer>().material = dirtMaterial;
		return q;
	}

	void updateQuad (GameObject q, int counter) {
		Vector3 temp = new Vector3(0, 0, counter * -1);
		q.transform.position = temp;
		Debug.Log ("Counter is" + counter);
		q.GetComponent<Renderer>().material.SetTexture ("_MainTex", GetTexture("Mask", counter));
	}

	public void clickCycle () {
		//Debug.Log("called cycle");
		int layer = numClicks;
		Debug.Log ("Numclicks" + numClicks);
		Debug.Log ("Dirtlayers length" + dirtLayers.Count);
		for (int i = 0; i < dirtLayers.Count; i++) {
			//Debug.Log ("cond true");
			Debug.Log ("moving " + i + " to " + layer);
			updateQuad (dirtLayers [i], layer);
			layer -= 1;
		} 
		GameObject newQ = generate ("Dirt", "Mask", (dirtLayers.Count), 7);
		dirtLayers.Add (newQ);
	}

	void randomFromSeed(string seed) {
		seed = seed.Substring (2, 7); 
		int seedInt = int.Parse(seed, System.Globalization.NumberStyles.HexNumber);
		Random.InitState (seedInt);
	}

	GameObject generate(string layerName, string mask, int iter, int limit) {
		// how to ensure increasing depth?
		int t = Random.Range (0, limit);
		//int m = Random.Range (0, limit);
		//Debug.Log("called generate");
		return genQuad(GetTexture(mask, 0), GetTexture(layerName, t), iter + 1);
	}

	public void click () {
     	// send transaction
	  	//when received, set numclicks, then call clickCycle()
		clickCycle ();
		//Debug.Log("incrementing");
		numClicks += 1;
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
