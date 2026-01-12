import { Logger } from 'winston'
import { LPTE } from './LPTE'
import { MultiBar } from 'cli-progress'
import { ModuleType } from './ModuleType'

export interface PackageJson {
  name: string
  version: string
  author: string
  dependencies?: { [n: string]: string }
  devDependencies?: { [n: string]: string }
  toolkit: ToolkitConfig
}

export interface PluginConfig {
  main: string
}

export interface ToolkitConfig {
  modes: ModuleType[]
  plugin: undefined | PluginConfig
  needsBuild?: boolean
  toolkitVersion?: string
  dependencies?: string[]
}

export interface Asset {
  name: string
  type: 'plugin' | 'module' | 'theme'
  version: string
  download_url: string
}

export declare class Module {
  packageJson: PackageJson
  plugin: undefined | Plugin
  folder: string
  asset?: Asset

  constructor (packageJson: any, folder: string)
  getName (): string
  getVersion (): string
  getNewestVersion (): string
  getAuthor (): string
  getConfig (): ToolkitConfig
  hasMode (mode: ModuleType): boolean
  hasPlugin (): boolean
  getPlugin (): Plugin | undefined
  getFolder (): string
  toJson (goDeep: boolean): any
}

export const enum PluginStatus {
  RUNNING = 'RUNNING',
  UNAVAILABLE = 'UNAVAILABLE',
  DEGRADED = 'DEGRADED'
}

export declare class PluginContext {
  log: Logger
  require: (file: string) => any
  LPTE: LPTE
  plugin: Plugin
  progress: MultiBar

  constructor (plugin: Plugin)
}

export declare class Plugin {
  isLoaded: boolean
  status: PluginStatus
  module: Module
  context: undefined | PluginContext

  constructor (module: Module)

  getModule (): Module
  getPluginConfig (): any
  getMain (): string
  toJson (goDeep: boolean): any
  initialize (): void
}