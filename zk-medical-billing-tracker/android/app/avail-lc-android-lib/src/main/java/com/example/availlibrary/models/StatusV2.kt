package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class StatusV2(

    @SerializedName("modes") var modes: ArrayList<String> = arrayListOf(),
    @SerializedName("app_id") var appId: Int? = null,
    @SerializedName("genesis_hash") var genesisHash: String? = null,
    @SerializedName("network") var network: String? = null,
    @SerializedName("blocks") var blocks: Block? = Block()

)