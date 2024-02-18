package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class Extension(

    @SerializedName("rows") var rows: Int? = null,
    @SerializedName("cols") var cols: Int? = null,
    @SerializedName("data_root") var dataRoot: String? = null,
    @SerializedName("commitments") var commitments: ArrayList<String> = arrayListOf(),
    @SerializedName("app_lookup") var appLookup: AppLookup? = AppLookup()

)
