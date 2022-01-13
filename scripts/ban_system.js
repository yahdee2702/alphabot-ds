const { info } = require("console");
const fs = require("fs");
const { GetUserFromID, GetIDFromArray } = require("./misc_scripts");
require("dotenv").config();

const bannedJson = `${process.env.DataFolder}/banned_list.json`;

async function IsBanned(user) {
  const bannedJson = `${process.env.DataFolder}/banned_list.json`;
  let ret = {
    condition: false,
    position: 0,
  };

  let data0 = await fs.readFileSync(bannedJson, "utf-8");

  let data = JSON.parse(data0.toString());
  let length = Object.keys(data).length;

  for (let index = 1; index <= length; index++) {
    const data1 = data[index.toString()];
    if (data1.id == user.id) {
      ret.condition = true;
      ret.position = index;
      break;
    }
  }

  return ret;
}

function BanUser(user, onSuccess, onFailed) {
  fs.readFile(bannedJson, "utf-8", async (err, data0) => {
    if (err) throw err;

    let isBanned = await IsBanned(user);

    if (!isBanned.condition) {
      if (onSuccess != null) onSuccess(user);
    } else {
      if (onFailed != null) onFailed(user);
      return;
    }

    let todayDate = new Date();
    let data = JSON.parse(data0.toString());
    let length = Object.keys(data).length;

    let newData = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      date: todayDate.getTime(),
    };

    data[length + 1] = newData;
    UpdateBannedList(data);
  });
}

function UnBanUser(user, onSuccess, onFailed) {
  fs.readFile(bannedJson, async (err, data0) => {
    if (err) throw err;

    let isBanned = await IsBanned(user);

    if (isBanned.condition) {
      if (onSuccess != null) onSuccess(user);
    } else {
      if (onFailed != null) onFailed(user);
      return;
    }

    let data = JSON.parse(data0.toString());
    let length = Object.keys(data).length;

    delete data[isBanned.position.toString()];

    for (let index = isBanned.position + 1; index <= length; index++) {
      const element = data[index.toString()];
      const newPos = (index - 1).toString();
      delete data[index.toString()];
      data[newPos] = element;
    }
    UpdateBannedList(data);
  });
}

function UpdateBannedList(newData) {
  let ret = JSON.stringify(newData);

  try {
    fs.writeFileSync(bannedJson, ret);
    console.log("Succesfully updated the banned list");
  } catch (err1) {
    console.error(err1);
  }
}

module.exports = {
  ban: {
    identifier: ["ban", "getout", "trol"],
    runnable: (client, info, args) => {
      if (args.length <= 0) return;

      let id = GetIDFromArray(args);
      let user = GetUserFromID(id);

      BanUser(
        user,
        (user0) => {
          console.log(`Successfully Banned user ${user0.tag}.`);
          info.reply(`Successfully Banned user <@!${user0.id}>.`);
        },
        (user0) => {
          console.log(
            `Cannot Ban user ${user0.tag} cause they are already banned.`
          );
          info.reply(
            `Cannot Ban user <@!${user0.id}> because they are already banned.`
          );
        }
      );
    },
  },
  unban: {
    identifier: ["unban", "getin", "untrol"],
    runnable: (client, info, args) => {
      if (args.length <= 0) return;

      let id = GetIDFromArray(args);
      let user = GetUserFromID(id);

      UnBanUser(
        user,
        (user0) => {
          console.log(`Successfully Unbanned user ${user0.tag}.`);
          info.reply(`Successfully Unbanned user <@!${user0.id}>.`);
        },
        (user0) => {
          console.log(
            `Cannot Unban user ${user0.tag} because they are already unbanned.`
          );
          info.reply(
            `Cannot Unban user <@!${user0.id}> because they are already unbanned.`
          );
        }
      );
    },
  },
};
