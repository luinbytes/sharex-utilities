/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** ShareX Executable Path - Optional. If auto-detect fails, provide the full path to ShareX.exe (supports %ENV% variables). */
  "sharexPath"?: string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `example-command` command */
  export type ExampleCommand = ExtensionPreferences & {}
  /** Preferences accessible in the `list-command` command */
  export type ListCommand = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-open-main` command */
  export type SharexOpenMain = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-show-path` command */
  export type SharexShowPath = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-capture-region` command */
  export type SharexCaptureRegion = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-capture-fullscreen` command */
  export type SharexCaptureFullscreen = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-capture-active-window` command */
  export type SharexCaptureActiveWindow = ExtensionPreferences & {}
  /** Preferences accessible in the `sharex-capture-window` command */
  export type SharexCaptureWindow = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `example-command` command */
  export type ExampleCommand = {}
  /** Arguments passed to the `list-command` command */
  export type ListCommand = {}
  /** Arguments passed to the `sharex-open-main` command */
  export type SharexOpenMain = {}
  /** Arguments passed to the `sharex-show-path` command */
  export type SharexShowPath = {}
  /** Arguments passed to the `sharex-capture-region` command */
  export type SharexCaptureRegion = {}
  /** Arguments passed to the `sharex-capture-fullscreen` command */
  export type SharexCaptureFullscreen = {}
  /** Arguments passed to the `sharex-capture-active-window` command */
  export type SharexCaptureActiveWindow = {}
  /** Arguments passed to the `sharex-capture-window` command */
  export type SharexCaptureWindow = {}
}

