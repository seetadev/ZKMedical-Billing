package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class AppLookup(

    @SerializedName("size") var size: Int? = null,
    @SerializedName("index") var index: ArrayList<String> = arrayListOf()

)