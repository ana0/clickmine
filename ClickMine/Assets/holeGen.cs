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


	void Start () {
		// fetch Player info from chain here
		randomFromSeed(seed);
	}

	Texture GetTexture(string nameType, int identifier) {
		// load a texture with a name like "Rock1" or "Mask6"
		Texture tex = Resources.Load ("Textures/" + nameType + identifier) as Texture;
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
		return mat;
	}

	void genQuad (Texture maskTex, Texture dirtTex) {
		// generates a fullsize quad using materials given
		var q = GameObject.CreatePrimitive(PrimitiveType.Quad);
		var quadHeight = (Camera.main.orthographicSize + 1.0) * 2.0;
		var quadWidth = quadHeight * Screen.width / Screen.height;
		q.transform.localScale = new Vector3((float)quadWidth, (float)quadHeight, 1f);
		Material dirtMaterial = MakeMaterial (maskTex, dirtTex);
		q.GetComponent<Renderer>().material = dirtMaterial;
	}

	void randomFromSeed(string seed) {
		int seedInt = int.Parse(seed, System.Globalization.NumberStyles.HexNumber);
		Random.InitState (seedInt);
	}

	void generate(string layerName, string mask, int limit) {
		// how to ensure increasing depth?
		int t = Random.Range (0, limit);
		int m = Random.Range (0, limit);
		genQuad(GetTexture(layerName, t), GetTexture(layerName, m));
	}

	void ClickCycle (string seed) {
		
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
