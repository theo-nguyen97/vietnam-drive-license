# kotlinx.serialization: giữ các lớp dữ liệu được đánh dấu @Serializable
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class vn.lailua.app.** {
    *** Companion;
}
-keepclasseswithmembers class vn.lailua.app.** {
    kotlinx.serialization.KSerializer serializer(...);
}
