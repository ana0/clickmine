using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking; 
using Nethereum.JsonRpc.UnityClient;
using Nethereum.Hex.HexTypes;
using Nethereum.RPC.Eth.Blocks;




public class GetBlock : MonoBehaviour {
	public Text blockNumberText;
	private float blockCheckRate = 3f;
	private float lastBlockCheckTime;
	private bool supportsProperThreads = false;

	void Start () 
	{
		lastBlockCheckTime = 0f;

		if(!supportsProperThreads)
		{
			StartCoroutine(CheckBlockNumber());
		}
	}


	public IEnumerator CheckBlockNumber() 
	{
		while(true)
		{ 
			yield return new WaitForSeconds(2);
			var blockNumberRequest = new EthBlockNumberUnityRequest("https://mainnet.infura.io");
			yield return blockNumberRequest.SendRequest();
			if(blockNumberRequest.Exception == null) {
				Debug.Log (blockNumberRequest.Result.Value.ToString ());
			}
		}
	}



	public void Update () 
	{
		if(supportsProperThreads)
		{
			lastBlockCheckTime += Time.deltaTime;

			if (lastBlockCheckTime >= blockCheckRate) 
			{
				lastBlockCheckTime = 0f;
				//CheckBlockNumberOnBackgroundThread();
			}
		}
	}

	/* 
	public void CheckBlockNumberOnBackgroundThread()
	{
		Task<HexBigInteger>.Run(async () => 
		{
			return await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync();

		}).ContinueWith( blockNumber => 
		{
			blockNumberText.text = "Block: " + blockNumber.Result.Value.ToString();
		}, 
		TaskScheduler.FromCurrentSynchronizationContext());
	}

	*/

}



