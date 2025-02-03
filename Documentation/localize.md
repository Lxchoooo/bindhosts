# Translation Guide

## WebUI
### Fix Bad Translation

1. Find your language string file in `/module/webroot/locales/`.
2. Edit the string value with translated incorrectly.
3. [Create a Pull Request](https://github.com/bindhosts/bindhosts/pulls).

### Add a New Language

1. Make a copy of `/module/webroot/locales/A-template.json`
2. Rename it to `language_code-COUNTRY_CODE.json`, e.g., `en-US.json`.
3. Translate the string value inside.
4. [Create a Pull Request](https://github.com/bindhosts/bindhosts/pulls).

---

## Documentation
### Available documentations

- [README.md](https://github.com/bindhosts/bindhosts/blob/master/README.md)
- [hiding.md](https://github.com/bindhosts/bindhosts/blob/master/Documentation/hiding.md)
- [modes.md](https://github.com/bindhosts/bindhosts/blob/master/Documentation/modes.md)
- [usage.md](https://github.com/bindhosts/bindhosts/blob/master/Documentation/usage.md)

### Document name 
- Format: <br>`DOCNAME_language_code-COUNTRY_CODE.md`

- Example: <br>`README_zh-CN.md`
