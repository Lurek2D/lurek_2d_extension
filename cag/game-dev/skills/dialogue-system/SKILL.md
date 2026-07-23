---
name: dialogue-system
description: "Load this skill when implementing dialogue trees, text flow, choices, or conversation triggers in a game. Skip it for unrelated combat, rendering, or engine internals."
---

# Dialogue System

Dialog node trees, portraits, typewriter text, conditional branches, choices, and shop integration.

## Dialog Data Structure

```lua
local dialog_intro = {
    { id = 1, speaker = "Elder", portrait = "elder.png",
      text = "Welcome, traveler. The forest is dangerous.", next = 2 },
    { id = 2, speaker = "Elder", portrait = "elder.png",
      text = "Will you help us?", choices = {
        { text = "Yes", next = 3 },
        { text = "Tell me more", next = 4 },
        { text = "No", next = 5, condition = function() return not game.flags.forced end },
    }},
}
```

## Dialog Runner

```lua
local dialog = { active = false, data = nil, node_index = nil, char_index = 0, timer = 0 }
local CHAR_SPEED = 0.03  -- seconds per character

local function start_dialog(data)
    dialog.active = true
    dialog.data = data
    dialog.node_index = 1
    dialog.char_index = 0
    dialog.timer = 0
end

local function current_node()
    if not dialog.data then return nil end
    for _, node in ipairs(dialog.data) do
        if node.id == dialog.node_index then return node end
    end
    return nil
end

local function advance_to(node_id)
    if not node_id then
        local node = current_node()
        if node and node.on_complete then node.on_complete() end
        dialog.active = false
        return
    end
    dialog.node_index = node_id
    dialog.char_index = 0
    dialog.timer = 0
end
```

## Typewriter Update

```lua
local function update_dialog(dt)
    if not dialog.active then return end
    local node = current_node()
    if not node then dialog.active = false; return end

    local full_len = #node.text
    if dialog.char_index < full_len then
        dialog.timer = dialog.timer + dt
        if dialog.timer >= CHAR_SPEED then
            dialog.timer = dialog.timer - CHAR_SPEED
            dialog.char_index = dialog.char_index + 1
        end
    end
end
```

## Input Handling

```lua
function lurek.keypressed(key)
    if not dialog.active then return end
    local node = current_node()
    if key == "return" or key == "space" then
        if dialog.char_index < #node.text then
            dialog.char_index = #node.text  -- skip to full text
        elseif node.choices then
            -- select current choice
            local choice = node.choices[dialog.choice_index or 1]
            advance_to(choice.next)
        else
            advance_to(node.next)
        end
    end
    if node.choices then
        if key == "up"   then dialog.choice_index = math.max(1, (dialog.choice_index or 1) - 1) end
        if key == "down" then dialog.choice_index = math.min(#node.choices, (dialog.choice_index or 1) + 1) end
    end
end
```

## Drawing the Dialog Box

```lua
local function draw_dialog()
    if not dialog.active then return end
    local node = current_node(); if not node then return end
    local bx, by, bw, bh = 20, 460, 760, 120
    lurek.render.setColor(0, 0, 0, 0.85)
    lurek.render.rectangle("fill", bx, by, bw, bh)
    lurek.render.setColor(1, 1, 1, 1)
    lurek.render.rectangle("line", bx, by, bw, bh)
    if node.speaker then lurek.render.print(node.speaker, bx + 10, by + 6) end
    lurek.render.print(node.text:sub(1, dialog.char_index), bx + 10, by + 26)
    if node.choices and dialog.char_index >= #node.text then
        for i, choice in ipairs(node.choices) do
            local mark = i == (dialog.choice_index or 1) and "> " or "  "
            lurek.render.print(mark .. choice.text, bx + 20, by + 50 + (i - 1) * 18)
        end
    end
end
```

## Common Pitfalls

- Validate node IDs and filter conditional choices before display.
- Use `dt` for typewriter timing, block gameplay input while active, and fire completion after the final node.
