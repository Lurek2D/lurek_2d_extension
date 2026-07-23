---
name: leaderboard
description: "Load this skill when implementing scoreboards, ranking displays, or run result tracking in a game. Skip it for unrelated world simulation or engine internals."
---

# Leaderboard

High score table with persistence, sorted display, new high score highlight, and reset.

## Score Entry

```lua
local MAX_SCORES = 10
local leaderboard = {}

local function load_leaderboard()
    local path = "saves/leaderboard.toml"
    if lurek.filesystem.exists(path) then
        local content = lurek.filesystem.read(path)
        local data = lurek.serialize.fromToml(content)
        leaderboard = data.scores or {}
    end
end

local function save_leaderboard()
    local data = { scores = leaderboard }
    local toml = lurek.serialize.toToml(data)
    lurek.filesystem.write("saves/leaderboard.toml", toml)
end
```

## Inserting a Score

```lua
local function is_high_score(score)
    if #leaderboard < MAX_SCORES then return true end
    return score > leaderboard[#leaderboard].score
end

local function insert_score(name, score)
    local entry = { name = name, score = score, date = os.date("%Y-%m-%d") }

    -- Find insertion position
    local pos = #leaderboard + 1
    for i = 1, #leaderboard do
        if score > leaderboard[i].score then
            pos = i
            break
        end
    end

    table.insert(leaderboard, pos, entry)

    -- Trim to max
    while #leaderboard > MAX_SCORES do
        leaderboard[#leaderboard] = nil
    end

    save_leaderboard()
    return pos  -- return rank for highlighting
end
```

## Display

```lua
local highlight_rank = nil

local function draw_leaderboard(ox, oy)
    lurek.render.setColor(0, 0, 0, 0.9)
    lurek.render.rectangle("fill", ox, oy, 400, 40 + #leaderboard * 28)
    lurek.render.setColor(1, 1, 0.5, 1)
    lurek.render.print("HIGH SCORES", ox + 140, oy + 8)

    for i, entry in ipairs(leaderboard) do
        local y = oy + 36 + (i - 1) * 28
        -- Highlight new score
        if i == highlight_rank then
            lurek.render.setColor(1, 1, 0, 1)
        else
            lurek.render.setColor(0.9, 0.9, 0.9, 1)
        end

        local rank = string.format("%2d.", i)
        local name = entry.name
        local score_str = tostring(entry.score)
        lurek.render.print(rank, ox + 20, y)
        lurek.render.print(name, ox + 60, y)
        lurek.render.print(score_str, ox + 280, y)
        lurek.render.print(entry.date or "", ox + 340, y)
    end
    lurek.render.setColor(1, 1, 1, 1)
end
```

## New High Score Flash

```lua
local flash_timer = 0

local function update_highlight(dt)
    if highlight_rank then flash_timer = flash_timer + dt end
end

-- Use this color in the existing leaderboard loop for the highlighted row.
local function highlight_color(index)
    if index ~= highlight_rank then return 0.9, 0.9, 0.9 end
    local pulse = 0.5 + 0.5 * math.sin(flash_timer * 6)
    return 1, 1, pulse
end
```

## Game Over Integration

```lua
local function on_game_over(final_score)
    if is_high_score(final_score) then
        -- Prompt for name (simplified)
        local name = "PLAYER"  -- replace with text input
        highlight_rank = insert_score(name, final_score)
        flash_timer = 0
    else
        highlight_rank = nil
    end
end
```

## Reset

```lua
local function reset_leaderboard()
    leaderboard = {}
    save_leaderboard()
    highlight_rank = nil
end

-- Register as debug command
register_command("resetscores", function()
    reset_leaderboard()
    console_print("Leaderboard cleared.")
end, "Clear all high scores")
```

## Common Pitfalls

- **Not saving after insert** — always call `save_leaderboard()` after modifying the table.
- **Unsorted after manual edit** — if players hand-edit the save file, re-sort on load.
- **Name too long** — cap name length (e.g., 12 chars) to prevent UI overflow.
