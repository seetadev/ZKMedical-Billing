import com.google.gson.annotations.SerializedName

data class HeaderData(
    @SerializedName("hash")
    val hash: String,
    @SerializedName("parent_hash")
    val parentHash: String,
    @SerializedName("number")
    val number: Int,
    @SerializedName("state_root")
    val stateRoot: String,
    @SerializedName("extrinsics_root")
    val extrinsicsRoot: String,
    @SerializedName("extension")
    val extension: Extension
)

data class Extension(
    @SerializedName("rows")
    val rows: Int,
    @SerializedName("cols")
    val cols: Int,
    @SerializedName("data_root")
    val dataRoot: String,
    @SerializedName("commitments")
    val commitments: List<String>,
    @SerializedName("app_lookup")
    val appLookup: AppLookup
)

data class AppLookup(
    @SerializedName("size")
    val size: Int,
    @SerializedName("index")
    val index: List<Any> // Change the type of index as per your actual data type
)
