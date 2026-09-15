"use client";

import { extend } from "@pixi/react";
import { Container, Graphics, Sprite, Text, TextureSource } from "pixi.js";

// Pixel art: never interpolate texels when scaling up.
TextureSource.defaultOptions.scaleMode = "nearest";

extend({ Container, Graphics, Sprite, Text });
