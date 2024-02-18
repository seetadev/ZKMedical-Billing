package com.example.availlibrary

import HeaderData
import android.util.Log
import com.example.availlibrary.models.BlockConfidence
import com.example.availlibrary.models.LatestBlock
import com.example.availlibrary.models.PublishMessage
import com.example.availlibrary.models.PublishMessageList
import com.example.availlibrary.models.PublishMessageListStrings
import com.example.availlibrary.models.StatusV1
import com.example.availlibrary.models.StatusV2
import com.google.gson.Gson
import java.util.concurrent.ForkJoinPool

class AvailLightClientLib(config: String, appId: Int) {

    private var config: String
    private var appId: Int
    private var lcRunning: Boolean = false;
    private var gson: Gson = Gson();

    init {
        this.appId = appId
        this.config = config
        System.loadLibrary("avail_light");
        startLightClientWithDataToDb({})
        val resp = getConfidenceList()
        Log.e("RESP", resp.toString())
        val data = "{\"data\": \"VGVzdCBkYXRhYWE=\"}"

    }

    fun startLightClient(onStop: () -> Unit) {
        ForkJoinPool.commonPool().submit {
            val resp = startNode(config)
        }
    }

    fun startLightClientWithDataToDb(onStop: () -> Unit) {
        ForkJoinPool.commonPool().submit {
            val resp = startNodeWithBroadcastsToDb(config)
        }
    }

    fun getLatestBlock(): LatestBlock? {
        return try {
            val response = latestBlock(config).toString();
            Log.e("Resp entry:", response)
            gson.fromJson(response, LatestBlock::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun geStatus(): StatusV1? {
        return try {
            val response = status(config, appId).toString();
            gson.fromJson(response, StatusV1::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null
        }
    }

    fun getConfidence(block: Int): BlockConfidence? {
        return try {
            val response = confidence(config, block).toString();
            gson.fromJson(response, BlockConfidence::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getStatusV2(): StatusV2? {
        return try {
            val response = getStatusV2(config).toString();
            gson.fromJson(response, StatusV2::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getConfidenceList(): PublishMessageList? {
        return try {
            val response = getConfidenceMessageList(config).toString()
            val publishMessageListStrings =
                gson.fromJson(response, PublishMessageListStrings::class.java)
            val messageList: PublishMessageList =
                PublishMessageList(messageList = mutableListOf<PublishMessage>())
            for (message in (publishMessageListStrings.messageList)!!) {
                messageList.messageList = messageList.messageList?.plus(
                    gson.fromJson(
                        message,
                        PublishMessage::class.java
                    )
                )
            }
            messageList
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getDataVerifiedList(): PublishMessageList? {
        return try {
            val response = getDataVerifiedMessageList(config).toString();
            val publishMessageListStrings =
                gson.fromJson(response, PublishMessageListStrings::class.java)
            val messageList: PublishMessageList =
                PublishMessageList(messageList = mutableListOf<PublishMessage>())
            for (message in (publishMessageListStrings.messageList)!!) {
                messageList.messageList = messageList.messageList?.plus(
                    gson.fromJson(
                        message,
                        PublishMessage::class.java
                    )
                )
            }
            messageList
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getHeaderVerifiedList(): PublishMessageList? {
        return try {
            val response = getHeaderVerifiedMessageList(config);
            val publishMessageListStrings =
                gson.fromJson(response, PublishMessageListStrings::class.java)
            val messageList: PublishMessageList =
                PublishMessageList(messageList = mutableListOf<PublishMessage>())
            for (message in (publishMessageListStrings.messageList)!!) {
                messageList.messageList = messageList.messageList?.plus(
                    gson.fromJson(
                        message,
                        PublishMessage::class.java
                    )
                )
            }
            messageList
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun submitTransaction(transaction: String, privateKey: String): String {
        return try {
            val response = submitTransaction(
                config, appId, transaction.toString(), privateKey.toString()
            );
            response.toString()
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            ""
        }
    }

    fun getBlockV2(): BlockConfidence? {
        return try {
            val response = getBlock(config).toString();
            gson.fromJson(response, BlockConfidence::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getBlockHeaderV2(block: Int): HeaderData? {
        return try {
            val response = getBlockHeader(config, block).toString();
            Log.e("Response", response)
            gson.fromJson(response, HeaderData::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun getBlockDataV2(block: Int, data: Boolean, extrinsics: Boolean): BlockConfidence? {
        return try {
            val response = getBlockData(config, block, data, extrinsics).toString();
            Log.e("Response", response)
            gson.fromJson(response, BlockConfidence::class.java)
        } catch (e: Exception) {
            Log.e("Latest Block.kt Error", e.toString());
            return null;
        }
    }

    fun onStop() {}

    private external fun getStatusV2(cfg: String): String
    private external fun submitTransaction(
        cfg: String, appId: Int, transaction: String, privateKey: String
    ): String


    // v1 Calls
    private external fun startNode(cfg: String): String

    private external fun startNodeWithBroadcastsToDb(cfg: String): String

    private external fun confidence(cfg: String, block: Int): String
    private external fun status(cfg: String, appId: Int): String
    private external fun latestBlock(cfg: String): String

    private external fun getConfidenceMessageList(cfg: String): String
    private external fun getHeaderVerifiedMessageList(cfg: String): String
    private external fun getDataVerifiedMessageList(cfg: String): String
    private external fun getBlock(cfg: String): String
    private external fun getBlockHeader(cfg: String, block: Int): String
    private external fun getBlockData(
        cfg: String,
        block: Int,
        data: Boolean,
        extrinsics: Boolean
    ): String


}