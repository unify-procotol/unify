import {
  BaseAdapter,
  CreateManyArgs,
  CreationArgs,
  FindManyArgs,
  FindOneArgs,
  UpdateArgs,
  UpdateManyArgs,
  UpsertArgs,
} from "@unilab/urpc-core";
import {
  matchesWhere,
  performUpsert,
  processFindManyArgs,
} from "@unilab/urpc-adapters";

export class IoTAdapter<T extends Record<string, any>> extends BaseAdapter<T> {
  static displayName = "IoTAdapter";

  private devices: T[] = [];

  async findMany(args: FindManyArgs<T>) {
    return processFindManyArgs(this.devices, args);
  }

  async findOne(args: FindOneArgs<T>) {
    const item = this.devices.find((item) => matchesWhere(item, args.where));
    if (!item) {
      return null;
    }
    return item;
  }

  async create(args: CreationArgs<T>) {
    const newDevice = {
      ...args.data,
    } as T;
    this.devices.push(newDevice);
    return newDevice;
  }

  async createMany(args: CreateManyArgs<T>) {
    const newDevices = args.data.map(
      (data) =>
        ({
          ...data,
        }) as T
    );
    this.devices.push(...newDevices);
    return newDevices;
  }

  async update(args: UpdateArgs<T>) {
    const device = this.devices.find((item) => matchesWhere(item, args.where));

    if (!device) {
      throw new Error("Device not found");
    }

    Object.assign(device, args.data);
    return device;
  }

  async updateMany(args: UpdateManyArgs<T>) {
    const devices = this.devices.filter((item) =>
      matchesWhere(item, args.where)
    );
    devices.forEach((device) => {
      Object.assign(device, args.data);
    });
    return devices;
  }

  async upsert(args: UpsertArgs<T>): Promise<T> {
    return performUpsert(
      args,
      this.findOne.bind(this),
      this.update.bind(this),
      this.create.bind(this)
    );
  }
}
