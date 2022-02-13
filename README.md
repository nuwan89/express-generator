
# Zircon-gen

Zircon-gen is a simple command line utility runs on **nodejs** for syncing your **Sequelize model** with the **migration** file in your **express js** project. Changes in migration file won't affect the model file.

## Installation

```console
npm i @slimkit-ui/express-generator --save-dev
```
## Usage

```console
npx zircon-gen sync --model models/customer.js --migration migrations/20210717142059-create-customers.js
```

### Note

Version  **1.0.0** is broken! Please use releases onwards **1.0.1**.

### Roadmap

- Generate restful controllers by model
- Generate routes for controllers
