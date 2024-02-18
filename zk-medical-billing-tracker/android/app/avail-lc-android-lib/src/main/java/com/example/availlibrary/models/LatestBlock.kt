package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class LatestBlock(

    @SerializedName("latest_block") var latestBlock: Int? = null

)