package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class StatusV1(
    @SerializedName("block_num") var blockNum: Int? = null,
    @SerializedName("confidence") var confidence: Double? = null,
    @SerializedName("app_id") var appId: Int? = null

)