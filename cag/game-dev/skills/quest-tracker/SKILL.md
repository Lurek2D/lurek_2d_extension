---
name: quest-tracker
description: "Load this skill when implementing quest state, objectives, progress tracking, or quest UI in a game. Skip it for unrelated combat systems or engine internals."
---

# Quest Tracker

Quest tables, objective types, multi-step progression, journal UI, and completion rewards.

## Quest Data

```lua
local QUESTS = {
    {
        id = "rescue_cat",
        title = "Lost Cat",
        description = "Find the elder's missing cat in the forest.",
        objectives = {
            { type = "reach",   target = "forest_cave", label = "Go to the forest cave", done = false },
            { type = "collect", target = "cat",   count = 1, current = 0, label = "Find the cat", done = false },
            { type = "talk",    target = "elder",  label = "Return to the elder", done = false },
        },
        rewards = { xp = 50, items = { { id = "potion", count = 3 } } },
        state = "inactive",  -- inactive | active | complete | failed
    },
}
```

## Quest Manager

```lua
local active_quests = {}

local function start_quest(quest_id)
    for _, q in ipairs(QUESTS) do
        if q.id == quest_id and q.state == "inactive" then
            q.state = "active"
            active_quests[#active_quests + 1] = q
            return true
        end
    end
    return false
end

local function current_objective(quest)
    for _, obj in ipairs(quest.objectives) do
        if not obj.done then return obj end
    end
    return nil
end

local function complete_quest(quest)
    quest.state = "complete"
    -- Grant rewards
    if quest.rewards.xp then player.xp = player.xp + quest.rewards.xp end
    if quest.rewards.items then
        for _, item in ipairs(quest.rewards.items) do
            add_item(player.inv, item.id, item.count)
        end
    end
end
```

## Objective Progress

Use one notifier for reach, collect, kill, and talk objectives; the wrappers keep call sites readable.

```lua
local function notify_objective(kind, target, amount)
    for _, quest in ipairs(active_quests) do
        local obj = current_objective(quest)
        if obj and obj.type == kind and obj.target == target then
            if obj.count then obj.current = (obj.current or 0) + (amount or 1) end
            if not obj.count or obj.current >= obj.count then obj.done = true end
            check_quest_complete(quest)
        end
    end
end

local notify_reach = function(id) notify_objective("reach", id) end
local notify_collect = function(id, n) notify_objective("collect", id, n) end
local notify_kill = function(kind) notify_objective("kill", kind) end
local notify_talk = function(id) notify_objective("talk", id) end

local function check_quest_complete(quest)
    for _, obj in ipairs(quest.objectives) do
        if not obj.done then return end
    end
            complete_quest(quest)
end
```

## Journal UI

```lua
local function draw_journal()
    lurek.render.setColor(0, 0, 0, 0.9)
    lurek.render.rectangle("fill", 50, 30, 700, 540)
    lurek.render.setColor(1, 1, 1, 1)
    lurek.render.print("QUEST JOURNAL", 60, 40)

    local y = 80
    for _, q in ipairs(active_quests) do
        lurek.render.setColor(1, 1, 0.5, 1)
        lurek.render.print(q.title, 70, y)
        y = y + 20
        for _, obj in ipairs(q.objectives) do
            local mark = obj.done and "[x] " or "[ ] "
            local progress = ""
            if obj.count then progress = " (" .. (obj.current or 0) .. "/" .. obj.count .. ")" end
            lurek.render.setColor(obj.done and {0.5,0.5,0.5} or {1,1,1})
            lurek.render.print("  " .. mark .. obj.label .. progress, 80, y)
            y = y + 18
        end
        y = y + 10
    end
    lurek.render.setColor(1, 1, 1, 1)
end
```

## Common Pitfalls

- `current_objective` enforces sequence; iterate all objectives for parallel quests and guard duplicate notifications.
- Remove completed quests from active state, serialize progress, and handle full inventory before granting rewards.
