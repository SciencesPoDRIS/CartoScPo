module.exports = {
    "env": {
        "browser": true,
        "es6": false,
        "node": true
    },
    "globals": {
        "angular": true,
        "_": true,
        "$": true
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
