import { Asset, Module, Plugin } from './Module'

export declare class ModuleService {
  modules: Module[]
  activePlugins: Plugin[]
  assets: Asset[]

  public initialize (): Promise<void>
  public getAssets (): Promise<Asset[]>
  public getModulePath (): string
  private loadPlugins (): Promise<Plugin[]>
  private loadPlugin (module: Module): Promise<Plugin>
  private handleFolder (folder: string): Promise<Module | null>
  private handleModule (folder: string): Promise<Module | null>
  private install(asset: Asset): Promise<void>
}