package com.example.availlibrary.models

import com.google.gson.annotations.SerializedName


data class BlockConfidence(

    @SerializedName("block") var block: Int? = null,
    @SerializedName("confidence") var confidence: Double? = null,
    @SerializedName("serialised_confidence") var serialisedConfidence: String? = null

)