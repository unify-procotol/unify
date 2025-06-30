import { repo } from "@unilab/store";
import { UserEntity } from "./entities/user";

// 全局变量用于 HTML 中的函数调用
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

    const user = await repo(UserEntity, "indexeddb").create({
      data: {
        id: getId(),
        name: getName(),
        email: getEmail(),
        avatar: getAvatar(),
      },
    });

    log(`✅ 用户创建成功: ${JSON.stringify(user, null, 2)}`);
  } catch (error) {
    log(`❌ 创建用户失败: ${error}`);
  }
};

window.findUser = async () => {
  try {
    const { getId } = getInputValues();

    const user = await repo(UserEntity, "indexeddb").findOne({
      where: { id: getId() },
    });

    if (user) {
      log(`✅ 找到用户: ${JSON.stringify(user, null, 2)}`);
      log(`🗣️ 用户问候: ${user.greet("欢迎使用 IndexedDB!")}`);
    } else {
      log(`❌ 未找到 ID 为 ${getId()} 的用户`);
    }
  } catch (error) {
    log(`❌ 查找用户失败: ${error}`);
  }
};

window.updateUser = async () => {
  try {
    const { getId, getName, getEmail, getAvatar } = getInputValues();

    const updatedUser = await repo(UserEntity, "indexeddb").update({
      where: { id: getId() },
      data: {
        name: getName(),
        email: getEmail(),
        avatar: getAvatar(),
      },
    });

    log(`✅ 用户更新成功: ${JSON.stringify(updatedUser, null, 2)}`);
  } catch (error) {
    log(`❌ 更新用户失败: ${error}`);
  }
};

window.deleteUser = async () => {
  try {
    const { getId } = getInputValues();

    const deleted = await repo(UserEntity, "indexeddb").delete({
      where: { id: getId() },
    });

    if (deleted) {
      log(`✅ 用户删除成功: ID ${getId()}`);
    } else {
      log(`❌ 未找到要删除的用户: ID ${getId()}`);
    }
  } catch (error) {
    log(`❌ 删除用户失败: ${error}`);
  }
};

window.listAllUsers = async () => {
  try {
    const users = await repo(UserEntity, "indexeddb").findMany();

    if (users.length > 0) {
      log(`✅ 找到 ${users.length} 个用户:`);
      users.forEach((user, index) => {
        log(`${index + 1}. ${JSON.stringify(user, null, 2)}`);
      });
    } else {
      log(`📭 没有找到任何用户`);
    }
  } catch (error) {
    log(`❌ 列出用户失败: ${error}`);
  }
};

window.countUsers = async () => {
  try {
    const count = await repo(UserEntity, "indexeddb").count();
    log(`📊 数据库中共有 ${count} 个用户`);
  } catch (error) {
    log(`❌ 统计用户失败: ${error}`);
  }
};

window.clearDatabase = async () => {
  try {
    // 获取所有用户并删除
    const users = await repo(UserEntity, "indexeddb").findMany();

    for (const user of users) {
      await repo(UserEntity, "indexeddb").delete({
        where: { id: user.id },
      });
    }

    log(`✅ 数据库已清空，删除了 ${users.length} 个用户`);
  } catch (error) {
    log(`❌ 清空数据库失败: ${error}`);
  }
};

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  log("🚀 IndexedDB Entity Repository Demo 已启动");
  log(
    "💡 提示: 打开浏览器开发者工具 -> Application -> Storage -> IndexedDB 查看数据"
  );
});
