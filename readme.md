# Autonomous Survival Game

## Overview

This is a simulation game where the player character is not directly controlled by the human. Instead, the character lives autonomously, making decisions based on its needs and the environment.

## Core Concepts

- **Autonomous Character:**
  The player character moves and acts on its own, guided by internal needs and goals.

- **Needs and Behaviors:**
  - **Hunger:**
    When hungry, the character will seek out the lake to fish for food.
  - **Resource Gathering:**
    - If the character needs wood (for fire), it will go to trees to gather wood.
    - If the character needs flint (for making fire), it will go to rocks to gather flint.
    - **Note:** Gathering resources does **not** destroy trees or rocks; they remain available for future use.
  - **Rest and Shelter:**
    - When tired, the character will attempt to build a place to sleep.
    - The character will rest next to the fire, especially after wandering for a long time.

- **Status Counters:**
  - The player's **hunger** and **tiredness** are tracked as values from 0 to 100.
  - These counters are displayed on the screen in real time.
  - The character's behavior is influenced by these values (e.g., high hunger prompts fishing, high tiredness prompts rest).

- **Environment:**
  - **Lake:** Used for fishing when hungry.
  - **Trees:** Source of wood for fire (not destroyed when gathered).
  - **Rocks:** Source of flint for fire (not destroyed when gathered).
  - **Fire:** Built by the character for warmth and rest.
  - **Shelter:** Built by the character for sleeping.

## Game Loop

- The character wanders the environment.
- Periodically, the character evaluates its needs (hunger, tiredness, resources).
- Based on needs, the character sets goals and moves toward relevant locations (lake, trees, rocks, shelter).
- The character performs actions (fishing, gathering, building, resting) autonomously.
- Hunger and tiredness counters are updated and shown on screen.

## Human Interaction

- The human does not control the character directly.
- The human may influence the simulation through menus or events, but the character's actions are self-driven.

## Future Features

- Menus for influencing character priorities or viewing stats.
- Events or challenges that affect the character's survival.
- More complex needs and behaviors.
