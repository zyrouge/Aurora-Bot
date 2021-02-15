const { Client, Collection } = require("discord.js");
const fs = require("fs-extra");
const { type } = require("os");
const path = require("path");
const yaml = require("yaml");
const utils = require("./utils");
const exit = process.exit;

class AuroraClient {
  constructor(settings) {
    this.bot = new Client();
    this.settings = settings;
    this.commands = {
      labels: new Collection(),
      aliases: new Collection(),
      resolve(cmd) {
        return this.labels.get(cmd) || this.labels.get(this.aliases.get(cmd));
      },
    };
  }

  connect() {
    return this.bot.login(this.settings.token);
  }
}

const getConfig = () => {
  const settingsPath = path.join(__dirname, "..", "config.yaml");
  if (!fs.existsSync(settingsPath)) {
    utils.logger.error("No 'config.yaml' was found");
    exit();
  }

  const content = fs.readFileSync(settingsPath, "utf8");
  if (!content) {
    utils.logger.error("Received an empty 'config.yaml'");
    exit();
  }

  const settings = yaml.parse(content);

  if (!settings.token) {
    utils.logger.error("No 'token' was found in 'config.yaml'");
    exit();
  }

  if (!settings.plugins) settings.plugins = [];

  return settings;
};

const loadPlugins = async (client, plugins) => {
  for (const pluginRaw of plugins) {
    try {
      const pluginSettings =
        typeof pluginRaw === "object" ? pluginSettings : {};
      const pluginName = pluginSettings.name || pluginRaw;
      const plugin = require(pluginName);

      if (!plugin.action) {
        utils.logger.warn(
          `Invalid plugin: No 'action' was found in '${pluginName}'`
        );
      } else {
        await plugin.action(client);
        utils.logger.info(`Plugin loaded: '${pluginName}'`);
      }
    } catch (err) {
      if (err && err.code === "MODULE_NOT_FOUND") {
        utils.logger.error(`Plugin not found: '${pluginRaw}'`);
        exit();
      } else utils.logger.error(`Invalid plugin: ${err}`);
    }
  }
};

const loadCommands = async (client) => {
  const dir = path.join(__dirname, "commands");
  await fs.ensureDir(dir);

  const files = await fs.readdir(dir);
  for (const file of files.filter((f) => f.endsWith(".js"))) {
    const filepath = path.join(dir, file);
    try {
      const command = require(filepath);

      command.location = filepath;
      client.commands.labels.set(command.name, command);
      if (command.aliases)
        command.aliases.forEach((alias) =>
          client.commands.aliases.set(alias, command.name)
        );
      utils.logger.info(`Command loaded: '${command.name}'`);
    } catch (err) {
      utils.logger.error(`Error loading command from '${filepath}': '${err}'`);
    }
  }
};

const loadEvents = async (client) => {
  const dir = path.join(__dirname, "events");
  await fs.ensureDir(dir);

  const files = await fs.readdir(dir);
  for (const file of files.filter((f) => f.endsWith(".js"))) {
    const filepath = path.join(dir, file);
    try {
      const event = require(filepath);
      const name = file.split(".")[0];
      client.bot.on(name, event.bind(null, client));
      delete require.cache[filepath];
      utils.logger.info(`Event loaded: '${name}'`);
    } catch (err) {
      utils.logger.error(`Error loading event from '${filepath}': '${err}'`);
    }
  }
};

const start = async () => {
  const settings = getConfig();

  const client = new AuroraClient(settings);

  await loadPlugins(client, settings.plugins);
  await loadEvents(client);
  await loadCommands(client);

  await client.connect().catch((err) => {
    if (err && err.code === "TOKEN_INVALID") {
      utils.logger.error("Invalid 'token' was provided");
      exit();
    } else utils.logger.error(err);
  });
};

module.exports = start;
