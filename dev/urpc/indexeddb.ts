import { UserEntity } from "./entities/user";
import { repo, URPC } from "@unilab/urpc";
import { Plugin } from "@unilab/urpc-core";
import { logging } from "@unilab/urpc-core/middleware";
import { IndexedDBAdapter } from "@unilab/urpc-adapters";

const MyPlugin: Plugin = {
  entities: [UserEntity],
};

URPC.init({
  plugins: [MyPlugin],
  middlewares: [logging()],
  entityConfigs: {
    user: {
      defaultSource: "indexeddb",
    },
  },
  globalAdapters: [IndexedDBAdapter],
});

declare global {
  interface Window {
    createUser: () => Promise<void>;
    findUser: () => Promise<void>;
    updateUser: () => Promise<void>;
    deleteUser: () => Promise<void>;
    listAllUsers: () => Promise<void>;
    countUsers: () => Promise<void>;
    clearDatabase: () => Promise<void>;
  }
}

function log(message: string) {
  const output = document.getElementById("output");
  if (output) {
    const timestamp = new Date().toLocaleTimeString();
    output.textContent += `[${timestamp}] ${message}\n`;
    output.scrollTop = output.scrollHeight;
  }
  console.log(message);
}

function getInputValues() {
  const getId = () =>
    (document.getElementById("userId") as HTMLInputElement).value;
  const getName = () =>
    (document.getElementById("userName") as HTMLInputElement).value;
  const getEmail = () =>
    (document.getElementById("userEmail") as HTMLInputElement).value;
  const getAvatar = () =>
    (document.getElementById("userAvatar") as HTMLInputElement).value;

  return { getId, getName, getEmail, getAvatar };
}

window.createUser = async () => {
  try {
    const { getId, getName, getEmail, getAvatar } = getInputValues();
    console.log("args:", {
      id: getId(),
      name: getName(),
      email: getEmail(),
      avatar: getAvatar(),
    });

    const user = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).create({
      data: {
        id: getId(),
        name: getName(),
        email: getEmail(),
        avatar: getAvatar(),
      },
    });

    log(`✅ User created successfully: ${JSON.stringify(user, null, 2)}`);
  } catch (error) {
    log(`❌ Failed to create user: ${error}`);
  }
};

window.findUser = async () => {
  try {
    const { getId } = getInputValues();

    const user = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).findOne({
      where: { id: getId() },
    });

    if (user) {
      log(`✅ User found: ${JSON.stringify(user, null, 2)}`);
      user.greet("Welcome to IndexedDB!");
    } else {
      log(`❌ User not found with ID: ${getId()}`);
    }
  } catch (error) {
    log(`❌ Failed to find user: ${error}`);
  }
};

window.updateUser = async () => {
  try {
    const { getId, getName, getEmail, getAvatar } = getInputValues();

    const updatedUser = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).update({
      where: { id: getId() },
      data: {
        name: getName(),
        email: getEmail(),
        avatar: getAvatar(),
      },
    });

    log(
      `✅ User updated successfully: ${JSON.stringify(updatedUser, null, 2)}`
    );
  } catch (error) {
    log(`❌ Failed to update user: ${error}`);
  }
};

window.deleteUser = async () => {
  try {
    const { getId } = getInputValues();

    const deleted = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).delete({
      where: { id: getId() },
    });

    if (deleted) {
      log(`✅ User deleted successfully: ID ${getId()}`);
    } else {
      log(`❌ User not found for deletion: ID ${getId()}`);
    }
  } catch (error) {
    log(`❌ Failed to delete user: ${error}`);
  }
};

window.listAllUsers = async () => {
  try {
    const users = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).findMany();

    if (users.length > 0) {
      log(`✅ Found ${users.length} users:`);
      users.forEach((user, index) => {
        log(`${index + 1}. ${JSON.stringify(user, null, 2)}`);
      });
    } else {
      log(`📭 No users found`);
    }
  } catch (error) {
    log(`❌ Failed to list users: ${error}`);
  }
};

window.clearDatabase = async () => {
  try {
    const users = await repo({
      entity: UserEntity,
      source: "indexeddb",
    }).findMany();

    for (const user of users) {
      await repo({
        entity: UserEntity,
        source: "indexeddb",
      }).delete({
        where: { id: user.id },
      });
    }

    log(`✅ Database cleared, deleted ${users.length} users`);
  } catch (error) {
    log(`❌ Failed to clear database: ${error}`);
  }
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  log("🚀 IndexedDB Entity Repository Demo started");
  log(
    "💡 Tip: Open browser DevTools -> Application -> Storage -> IndexedDB to view data"
  );
});
