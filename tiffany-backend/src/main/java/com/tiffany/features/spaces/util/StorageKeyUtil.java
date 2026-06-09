package com.tiffany.features.spaces.util;

public final class StorageKeyUtil {

    private static final String ROOT = "tiffany_furniture";

    private StorageKeyUtil() {}

    /** tiffany_furniture/yyyy-MM-dd/20240607T143022-a3f2.jpg */
    public static String key(String name) {
        return ROOT + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** tiffany_furniture/ */
    public static String rootPrefix() {
        return ROOT + "/";
    }
}
