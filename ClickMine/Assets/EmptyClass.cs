using System;
using System.Collections;
using UnityEngine;
using Nethereum.JsonRpc.UnityClient;
using Nethereum.JsonRpc.Client;
using Nethereum.RPC.Eth.Transactions;
using Nethereum.RPC.Eth.DTOs;

public class SendTransactionExample
{
	string privateKey;
	string fromAddress;
	string toAddress;

	public IEnumerator SendTransaction () {
		yield return new WaitForSeconds (2);

		//Build transaction 
		TransactionInput transInput = new TransactionInput();
		transInput.Value = "0x43";
		transInput.To = toAddress;
		transInput.From = fromAddress;
		transInput.Gas = "0x76c0";
		transInput.GasPrice = "0x9184272a000";

		//Create Unity Request with the private key, url and user address 
		var transactionSignedRequest = new TransactionSignedUnityRequest ("http://localhost:8545", privateKey, fromAddress);

		yield return transactionSignedRequest.SignAndSendTransaction (transInput);

		if (transactionSignedRequest.Exception == null) {
			Debug.Log ("Submitted tx: " + transactionSignedRequest.Result);
		} else {
			Debug.Log ("Error submitted tx: " + transactionSignedRequest.Exception.Message);
		}

	}
}


