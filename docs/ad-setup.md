# Ad Setup

The admob ID is kept out of the public repository for security reasons. For this reason, the `app.json` file is excluded as well, since the `react-native-google-mobile-ads` library requires the ID to be in that file.

To be able to build the application, two files are need to be added that are not pushed to the repository. The hidden values can be found on the admob dashboard.

1. Create a `src/config/admob.config.json` file with the following content:

    ```
    {
        "ios": {
            "appId": "<IOS_APP_ID>",
            "interstitialId": "<IOS_RECEIPT_SCAN_INTERSTITIAL_ID>"
        },
        "android": {
            "appId": "<ANDROID_APP_ID>",
            "interstitialId": "<ANDROID_RECEIPT_SCAN_INTERSTITIAL_ID>"
        }
    }
    ```

2. Create the `app.json` file at the repo root:
    ```
    {
        "name": "Splitsies",
        "displayName": "Splitsies",
        "react-native-google-mobile-ads": {
            "android_app_id": "<ANDROID_APP_ID>",
            "ios_app_id": "<IOS_APP_ID>"
        },
        "sk_ad_network_items": [
            "cstr6suwn9.skadnetwork",
            "4fzdc2evr5.skadnetwork",
            "4pfyvq9l8r.skadnetwork",
            "2fnua5tdw4.skadnetwork",
            "ydx93a7ass.skadnetwork",
            "5a6flpkh64.skadnetwork",
            "p78axxw29g.skadnetwork",
            "v72qych5uu.skadnetwork",
            "ludvb6z3bs.skadnetwork",
            "cp8zw746q7.skadnetwork",
            "3sh42y64q3.skadnetwork",
            "c6k4g5qg8m.skadnetwork",
            "s39g8k73mm.skadnetwork",
            "3qy4746246.skadnetwork",
            "f38h382jlk.skadnetwork",
            "hs6bdukanm.skadnetwork",
            "v4nxqhlyqp.skadnetwork",
            "wzmmz9fp6w.skadnetwork",
            "yclnxrl5pm.skadnetwork",
            "t38b2kh725.skadnetwork",
            "7ug5zh24hu.skadnetwork",
            "gta9lk7p23.skadnetwork",
            "vutu7akeur.skadnetwork",
            "y5ghdn5j9k.skadnetwork",
            "n6fk4nfna4.skadnetwork",
            "v9wttpbfk9.skadnetwork",
            "n38lu8286q.skadnetwork",
            "47vhws6wlr.skadnetwork",
            "kbd757ywx3.skadnetwork",
            "9t245vhmpl.skadnetwork",
            "eh6m2bh4zr.skadnetwork",
            "a2p9lx4jpn.skadnetwork",
            "22mmun2rn5.skadnetwork",
            "4468km3ulz.skadnetwork",
            "2u9pt9hc89.skadnetwork",
            "8s468mfl3y.skadnetwork",
            "klf5c3l5u5.skadnetwork",
            "ppxm28t8ap.skadnetwork",
            "ecpz2srf59.skadnetwork",
            "uw77j35x4d.skadnetwork",
            "pwa73g5rt2.skadnetwork",
            "mlmmfzh3r3.skadnetwork",
            "578prtvx9j.skadnetwork",
            "4dzt52r2t5.skadnetwork",
            "e5fvkxwrpn.skadnetwork",
            "8c4e2ghe7u.skadnetwork",
            "zq492l623r.skadnetwork",
            "3rd42ekr43.skadnetwork",
            "3qcr597p9d.skadnetwork"
        ]
    }
    ```