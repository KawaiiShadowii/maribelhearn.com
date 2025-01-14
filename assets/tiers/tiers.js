/*global $ html2canvas getCookie deleteCookie MobileDragDrop*/
if (typeof MobileDragDrop !== "undefined") {
    MobileDragDrop.polyfill({
        holdToDrag: 200
    });
}

var MAX_NUMBER_OF_TIERS = 100,
    MAX_NAME_LENGTH = 50,
    categories = {},
    gameCategories = {},
    shotCategories = {},
    tieredItems = [],
    sorts = ["characters", "works", "shots"],
    defaultTiers = ["S", "A", "B", "C"],
    defaultColour = "#1b232e",
    defaultWidth = (navigator.userAgent.indexOf("Mobile") > -1 || navigator.userAgent.indexOf("Tablet") > -1) ? 60 : 120,
    defaultSize = 32,
    settings = {
        "categories": {
            "Main": { enabled: true }, "HRtP": { enabled: true }, "SoEW": { enabled: true }, "PoDD": { enabled: true },
            "LLS": { enabled: true }, "MS": { enabled: true }, "EoSD": { enabled: true }, "PCB": { enabled: true },
            "IN": { enabled: true }, "PoFV": { enabled: true }, "MoF": { enabled: true }, "SA": { enabled: true },
            "UFO": { enabled: true }, "TD": { enabled: true }, "DDC": { enabled: true }, "LoLK": { enabled: true },
            "HSiFS": { enabled: true }, "WBaWC": { enabled: true }, "UM": { enabled: true }, "Spinoff": { enabled : true },
            "Manga": { enabled: true }, "CD": { enabled: true }
        },
        "gameCategories": {
            "PC-98": { enabled: true }, "Classic": { enabled: true }, "Modern1": { enabled: true }, "Modern2": { enabled: true },
            "Mangas": { enabled: true }, "Books": { enabled: true }, "CDs": { enabled: true }
        },
        "shotCategories": {
            "SoEW": { enabled : true }, "PoDD": { enabled : true }, "LLS": { enabled : true }, "MS": { enabled : true },
            "EoSD": { enabled: true }, "PCB": { enabled: true }, "IN": { enabled: true }, "PoFV": { enabled: true },
            "MoF": { enabled: true }, "SA": { enabled: true }, "UFO": { enabled: true }, "TD": { enabled: true },
            "DDC": { enabled: true }, "LoLK": { enabled: true }, "HSiFS": { enabled: true }, "WBaWC": { enabled: true },
            "UM": { enabled: true }
        },
        "characters": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "works": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "shots": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "pc98Enabled": true,
        "windowsEnabled": true,
        "maleEnabled": true,
        "sort": "characters"
    },
    windows = ["EoSD", "PCB", "IN", "PoFV", "MoF", "SA", "UFO", "TD", "DDC", "LoLK", "HSiFS", "WBaWC", "UM", "Spinoff"],
    secondSheet = ["SA", "UFO", "TD", "DDC", "LoLK", "HSiFS", "WBaWC", "UM", "Spinoff", "Manga", "CD"],
    secondSheetMobile = ["IN", "PoFV", "MoF", "SA", "UFO", "TD"],
    thirdSheet = ["DDC", "LoLK", "HSiFS", "WBaWC", "UM", "Manga", "CD"],
    secondSheetShots = ["LoLK", "HSiFS", "WBaWC", "UM", "SoEW", "PoDD", "LLS", "MS"],
    spinoffs = ["IaMP", "SWR", "Soku", "DS", "GFW", "HM", "ULiL", "AoCF"],
    exceptions = ["SuikaIbuki", "IkuNagae", "TenshiHinanawi"],
    exceptionsMobile = ["YukariYakumo", "YuyukoSaigyouji", "SuikaIbuki", "IkuNagae", "TenshiHinanawi", "Hisoutensoku", "HatateHimekaidou", "SunnyMilk", "LunaChild", "StarSapphire", "HatanoKokoro"],
    exceptionsThird = ["SumirekoUsami", "JoonYorigami", "ShionYorigami", "YuumaToutetsu"],
    exceptionsShots = ["DDCSakuyaA", "DDCSakuyaB", "PoFVMerlin", "PoFVLunasa"],
    maleCharacters = ["SinGyokuM", "Genjii", "Unzan", "RinnosukeMorichika", "FortuneTeller"],
    pc98 = ["HRtP", "SoEW", "PoDD", "LLS", "MS"],
    tieredClasses = ["tiered_characters1", "tiered_characters2", "tiered_works", "tiered_shots"],
    tiers = {},
    gameTiers = {},
    shotTiers = {},
    multiSelection = [],
    following = "",
    tierView = false,
    smallPicker = false,
    unsavedChanges = false;

function getTierNumOf(item) {
    var tierList = getCurrentTierList(), tierNum, i;

    for (tierNum in tierList) {
        for (i = 0; i < tierList[tierNum].chars.length; i++) {
            if (tierList[tierNum].chars[i] === item.removeSpaces()) {
                return Number(tierNum);
            }
        }
    }

    return false;
}

function getPositionOf(item) {
    if (!item || !isItem(item)) {
        return -1;
    }

    return Number($("#" + item).parent().attr("id").split("_")[1]);
}

function getItemAt(tierNum, pos) {
    var tierList = getCurrentTierList();

    return tierList[tierNum].chars[pos];
}

function getCategoryOf(item) {
    if (!item || !isItem(item)) {
        return false;
    }

    var cats = getCurrentCategories(), categoryName;

    for (categoryName in cats) {
        if (JSON.stringify(cats[categoryName].chars).removeSpaces().contains(item.removeSpaces())) {
            return categoryName;
        }
    }

    return false;
}

function getSpritesheetOf(item, category) {
    if (settings.sort == "works" || settings.sort == "shots" && !isMobile()) {
        return "";
    }

    if (!category) {
        category = getCategoryOf(item);
    }

    if (isMobile() && settings.sort == "characters" && (thirdSheet.contains(category) || exceptionsThird.contains(item.removeSpaces()))) {
        return 3;
    } else if (isMobile() && settings.sort == "characters" && (secondSheetMobile.contains(category) || exceptionsMobile.contains(item.removeSpaces()))) {
        return 2;
    } else if (settings.sort == "characters" && secondSheet.contains(category) && !exceptions.contains(item.removeSpaces())) {
        return 2;
    } else if (settings.sort == "shots" && (secondSheetShots.contains(category) || exceptionsShots.contains(item.removeSpaces()))) {
        return 2;
    }

    return 1;
}

function getCurrentCategories() {
    if (settings.sort == "characters") {
        return categories;
    }

    if (settings.sort == "works") {
        return gameCategories;
    }

    return shotCategories;
}

function getCurrentCategorySettings() {
    if (settings.sort == "characters") {
        return settings.categories;
    }

    if (settings.sort == "works") {
        return settings.gameCategories;
    }

    return settings.shotCategories;
}

function getCurrentTierList(sort) {
    if (!sort) {
        sort = settings.sort;
    }

    if (sort == "characters") {
        return tiers;
    }

    if (sort == "works") {
        return gameTiers;
    }

    return shotTiers;
}

function isMobile() {
    return navigator.userAgent.indexOf("Mobile") > -1 || navigator.userAgent.indexOf("Tablet") > -1;
}

function isCharacter(character) {
    return character !== "" && JSON.stringify(categories).removeSpaces().contains(character);
}

function isWork(work) {
    return work !== "" && JSON.stringify(gameCategories).removeSpaces().contains(work);
}

function isItem(item) {
    var cats = getCurrentCategories();

    return item !== "" && JSON.stringify(cats).removeSpaces().contains(item);
}

function isCategory(category) {
    return category !== "" && (Object.keys(categories).contains(category) || Object.keys(gameCategories).contains(category));
}

function isTiered(item) {
    var i;

    if (!item) {
        return false;
    }

    for (i = 0; i < tieredClasses.length; i++) {
        if ($("#" + item).hasClass(tieredClasses[i])) {
            return true;
        }
    }

    return false;
}

function allTiered(categoryName) {
    var cats = getCurrentCategories(), i;

    for (i = 0; i < cats[categoryName].chars.length; i++) {
        if (!isTiered(cats[categoryName].chars[i].removeSpaces())) {
            return false;
        }
    }

    return true;
}

function setPickerItemEvents(item) {
    item = item.removeSpaces();
    $("#" + item).off("dblclick");
    $("#" + item).off("contextmenu");
    $("#" + item).off("dragstart");
    $("#" + item).off("dragover dragenter");
    $("#" + item).off("click");
    $("#" + item).on("dragstart", drag);
    $("#" + item).on("click", toggleMulti);

    if (!isMobile()) {
        $("#" + item).on("dblclick", {name: $("#" + item).attr("title")}, addMenu);
    } else {
        $("#" + item).on("contextmenu", preventContextMenu);
    }
}

function setTieredItemEvents(item, tierNum) {
    $("#" + item).off("dblclick");
    $("#" + item).off("contextmenu");
    $("#" + item).off("dragstart");
    $("#" + item).off("dragover dragenter");
    $("#" + item).off("click");
    $("#" + item).on("dragstart", drag);
    $("#" + item).on("dragover dragenter", allowDrop);
    $("#" + item).on("click", toggleMulti);

    if (isMobile()) {
        $("#" + item).on("contextmenu", preventContextMenu);
    } else {
        $("#" + item).on("dblclick", {name: $("#" + item).attr("title")}, addMenu);
        $("#" + item).on("contextmenu", {tierNum: tierNum}, tieredContextMenu);
    }
}

function reloadTiers() {
    var cats = getCurrentCategories(), tierList = getCurrentTierList(), tierNum, i, item, id, j;

    for (i = 0; i < Object.keys(tiers).length; i++) {
        $("#tier" + i).html("");
    }

    if (tierList.isEmpty()) {
        return;
    }

    $("#tier_list_caption").html(settings[settings.sort].tierListName);

    for (tierNum in tierList) {
        tierNum = Number(tierNum);
        $("#tier_list_tbody").append("<tr id='tr" + tierNum +
        "' class='tier'><th id='th" + tierNum +
        "' class='tier_header' draggable='true'>" + tierList[tierNum].name + "</th><td id='tier" + tierNum + "' class='tier_content'></td></tr>");
        $("#tr" + tierNum).on("dragover dragenter", allowDrop);
        $("#tr" + tierNum).on("drop", drop);
        $("#tr" + tierNum).on("dragstart", drag);
        $("#tr" + tierNum).css("background-color", settings[settings.sort].tierListColour);
        $("#th" + tierNum).on("click", {tierNum: tierNum}, detectLeftCtrlCombo);
        $("#th" + tierNum).css("background-color", tierList[tierNum].bg);
        $("#th" + tierNum).css("color", tierList[tierNum].colour);
        $("#th" + tierNum).css("max-width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("font-size", settings[settings.sort].tierHeaderFontSize + "px");

        if (isMobile()) {
            $("#th" + tierNum).css("height", "60px");
            $("#" + item).on("contextmenu", preventContextMenu);
        } else {
            $("#th" + tierNum).on("contextmenu", {tierNum: tierNum}, detectRightCtrlCombo);
        }

        for (i = 0; i < tierList[tierNum].chars.length; i++) {
            item = tierList[tierNum].chars[i];

            if (item == "Mai") {
                item = "Mai PC-98";
            }

            $("#" + item).removeClass("list_" + settings.sort + getSpritesheetOf(item));
            $("#" + item).addClass("tiered_" + settings.sort + getSpritesheetOf(item));
            id = "tier" + tierNum + "_" + i;
            $("#tier" + tierNum).append("<span id='" + id + "'></span>");
            $("#" + id).html($("#" + item));
            setTieredItemEvents(item, tierNum);

            for (j in cats) {
                if (!$("#" + j).html().contains("list_" + settings.sort)) {
                    $("#" + j).css("display", "none");
                }
            }
        }
    }
}

function addDefaultTiers(sort) {
    var i, j;

    for (i = 0; i < defaultTiers.length; i++) {
        addTier({data: {tierName: defaultTiers[i]}});
    }

    for (i = 0; i < sorts.length; i++) {
        if (sorts[i] != sort) {
            settings.sort = sorts[i];

            for (j = 0; j < defaultTiers.length; j++) {
                addTier({data: {tierName: defaultTiers[j], noDisplay: true}});
            }
        }
    }

    settings.sort = sort;
}

function initialise() {
    addDefaultTiers(settings.sort);
    $("#tier_list_caption").html(settings[settings.sort].tierListName);

    if (isMobile()) {
        $("#add_tier_cell_mobile").attr("colspan", 2);
    }
}

function printMessage(html) {
    $("#msg_container" + (isMobile() ? "_mobile" : "")).html(html);
}

function switchSort() {
    $("#characters").html("");
    $("#tier_list_tbody").html("");

    if (isMobile()) {
        settings.sort = sorts[(sorts.indexOf(settings.sort) + 1) % sorts.length];
    } else {
        settings.sort = $("#sort").val();
    }

    loadItems();
    reloadTiers();
    saveConfirmation({data: {noMenu: true}});

    if (isMobile()) {
        printMessage("<strong class='confirmation'>Switched to " + settings.sort + "!</strong>");
    } else {
        printMessage("");
    }
}

function tieredContextMenu(event) {
    var item = this.id, tierNum = Number(event.data.tierNum);

    removeFromTier(item, tierNum);
    return false;
}

function insertAt(character, tierNum, pos, chars) {
    var counter, id, next;

    $("#tier" + tierNum + "_" + (pos)).append($("#" + character));

    for (counter = chars.length - 1; counter >= pos; counter -= 1) {
        id = getItemAt(tierNum, counter);
        next = "tier" + tierNum + "_" + (counter + 1);
        $("#" + next).append($("#" + id));
        chars[counter + 1] = id;
    }

    chars[pos] = character;
}

function addToTier(item, tierNum, pos, noDisplay) {
    var cats = getCurrentCategories(), tierList = getCurrentTierList(), categoryName = getCategoryOf(item), id, i;

    if (isTiered(item)) {
        return;
    }

    printMessage("");
    $("#" + item).removeClass("selected");
    $("#" + item).removeClass("list_" + settings.sort + getSpritesheetOf(item, categoryName));
    $("#" + item).addClass("tiered_" + settings.sort + getSpritesheetOf(item, categoryName));
    $("#" + item).off("contextmenu");

    if (isMobile()) {
        $("#" + item).on("contextmenu", preventContextMenu);
    } else {
        $("#" + item).on("contextmenu", {tierNum: tierNum}, tieredContextMenu);
    }

    $("#" + item).on("dragover dragenter", allowDrop);
    id = "tier" + tierNum + "_" + tierList[tierNum].chars.length;
    $("#tier" + tierNum).append("<span id='" + id + "'></span>");
    tieredItems.push(item);

    if (typeof pos == "number" && pos < tierList[tierNum].chars.length && !noDisplay) {
        insertAt(item, tierNum, pos, tierList[tierNum].chars);
    } else {
        if (!noDisplay) {
            $("#" + id).append($("#" + item));
        }

        tierList[tierNum].chars.pushStrict(item);
    }

    unsavedChanges = true;

    for (i = 0; i < cats[categoryName].chars.length; i++) {
        if (!isTiered(cats[categoryName].chars[i])) {
            return;
        }
    }

    $("#" + categoryName).css("display", "none");
}

function addMultiSelection(tierNum) {
    var multi = true, i;

    if (multiSelection.contains(following)) {
        for (i = 0; i < multiSelection.length; i++) {
            if (isTiered(multiSelection[i])) {
                removeFromTier(multiSelection[i], getTierNumOf(multiSelection[i]), multi);
            }

            addToTier(multiSelection[i], tierNum);
        }
    } else {
        for (i = 0; i < multiSelection.length; i++) {
            $("#" + multiSelection[i]).removeClass("selected");
        }

        if (isTiered(following)) {
            removeFromTier(following, getTierNumOf(following));
        }

        addToTier(following, tierNum);
    }

    multiSelection = [];
}

function removeMultiSelection() {
    var multi = true, i;

    if (multiSelection.contains(following)) {
        for (i = 0; i < multiSelection.length; i++) {
            $("#" + multiSelection[i]).removeClass("selected");
            removeFromTier(multiSelection[i], getTierNumOf(multiSelection[i]));
        }
    } else {
        for (i = 0; i < multiSelection.length; i++) {
            $("#" + multiSelection[i]).removeClass("selected");
        }

        removeFromTier(following, getTierNumOf(following), multi);
    }

    multiSelection = [];
}

function toggleMulti() {
    if (multiSelection.contains(this.id)) {
        multiSelection.remove(this.id);
        $("#" + this.id).removeClass("selected");
        return;
    }

    multiSelection.push(this.id);
    $("#" + this.id).addClass("selected");
}

function multiSelectionToText() {
    var result = [], i;

    for (i = 0; i < multiSelection.length; i++) {
        result.push($("#" + multiSelection[i]).attr("title"));
    }

    return result.join(", ");
}

function addToTierMobile(event) {
    var item = event.data.character, tierNum = event.data.tierNum, tierList = getCurrentTierList(), chars, character;

    $("#" + character).off("click");

    if (typeof item == "object") { // multiselection
        following = item[0];
        chars = multiSelectionToText();
        addMultiSelection(tierNum);
        printMessage("<strong class='confirmation'>Added " + chars + " to " + tierList[tierNum].name + "!</strong>");
        emptyModal();
        return;
    }

    character = item.removeSpaces();

    if (isTiered(character)) {
        changeToTier(character, tierNum);
    } else {
        addToTier(character, tierNum);
    }

    emptyModal();
}

function addMenu(event) {
    var character = event.data.name, tierList = getCurrentTierList(), tierNum;

    emptyModal();
    event.preventDefault();

    if (typeof character == "object") { // multiselection
        $("#modal_inner").html("<h3>" + multiSelectionToText() + "</h3><p>Add to tier:</p>");
    } else {
        $("#modal_inner").html("<h3>" + character +
        "</h3><p>" + (isTiered(character.removeSpaces()) ? "Change" : "Add") + " to tier:</p>");
    }

    for (tierNum = 0; tierNum < Object.keys(tierList).length; tierNum++) {
        $("#modal_inner").append("<input id='mobile_addtotier_" + tierNum +
        "' class='mobile_add' type='button' value='" + tierList[tierNum].name + "'>");
        $("#mobile_addtotier_" + tierNum).on("click", {character: character, tierNum: tierNum}, addToTierMobile);
    }
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function moveToBack(character, tierNum) {
    var tierList = getCurrentTierList();

    if (getPositionOf(character) === tierList[tierNum].chars.length - 1) {
        return;
    }

    removeFromTier(character, tierNum);
    addToTier(character, tierNum);
    printMessage("");
    unsavedChanges = true;
}

function moveItemTo(sourceItem, targetItem) {
    var tierList = getCurrentTierList(), sourcePos = getPositionOf(sourceItem), targetPos = getPositionOf(targetItem),
        tierNum = getTierNumOf(targetItem), tmp = $("#tier" + tierNum + "_" + sourcePos).html(), prevPos, nextPos, item, i;

    if (targetPos == tierList[tierNum].chars.length - 1) {
        moveToBack(sourceItem, tierNum);
        return;
    }

    if (sourcePos > targetPos) {
        for (i = sourcePos; i > targetPos; i--) {
            prevPos = i - 1;
            $("#tier" + tierNum + "_" + i).html($("#tier" + tierNum + "_" + prevPos).html());
            tierList[tierNum].chars[i] = tierList[tierNum].chars[prevPos];
        }
    } else if (sourcePos < targetPos) {
        for (i = sourcePos; i < targetPos; i++) {
            nextPos = i + 1;
            $("#tier" + tierNum + "_" + i).html($("#tier" + tierNum + "_" + nextPos).html());
            tierList[tierNum].chars[i] = tierList[tierNum].chars[nextPos];
        }
    } else {
        return;
    }

    $("#tier" + tierNum + "_" + targetPos).html(tmp);
    tierList[tierNum].chars[targetPos] = sourceItem;
    printMessage("");

    for (i in tierList[tierNum].chars) {
        item = tierList[tierNum].chars[i];
        setTieredItemEvents(item, tierNum);
    }

    unsavedChanges = true;
}

function moveMultiSelectionTo(targetItem) {
    var tierNum = getTierNumOf(targetItem), i;

    for (i = 0; i < multiSelection.length; i++) {
        $("#" + multiSelection[i]).removeClass("selected");
        moveItemTo(multiSelection[i], targetItem, tierNum);
    }

    multiSelection = [];
}

function changeMultiSelectionTo(tierNum, pos, multi) {
    var i;

    for (i = 0; i < multiSelection.length; i++) {
        $("#" + multiSelection[i]).removeClass("selected");
        changeToTier(multiSelection[i], tierNum, pos, multi);
    }

    multiSelection = [];
}

function removeFromTier(item, tierNum, multi, noDisplay) {
    var tierList = getCurrentTierList(), pos, counter, tmp;

    if (!item || getTierNumOf(item) !== tierNum) {
        return;
    }

    printMessage("");
    $("#" + item).removeClass("tiered_" + settings.sort + getSpritesheetOf(item));
    $("#" + item).addClass("list_" + settings.sort + getSpritesheetOf(item));
    $("#" + item).off("contextmenu");

    if (isMobile()) {
        $("#" + item).on("contextmenu", preventContextMenu);
    }

    if (!noDisplay) {
        pos = getPositionOf(item);
        $("#" + item + "C").append($("#" + item));
        $("#" + getCategoryOf(item)).css("display", "block");

        if (tierNum !== false) {
            for (counter = pos + 1; counter < tierList[tierNum].chars.length; counter += 1) {
                tmp = getItemAt(tierNum, counter);
                $("#tier" + tierNum + "_" + counter).remove("#" + tmp);
                $("#tier" + tierNum + "_" + (counter - 1)).append($("#" + tmp));
            }

            $("#tier" + tierNum + "_" + (tierList[tierNum].chars.length - 1)).remove();
        }
    }

    tierList[tierNum].chars.remove(item);
    tieredItems.remove(item);

    if (!multi && multiSelection.contains(item)) {
        $("#" + item).removeClass("selected");
        multiSelection.remove(item);
    }

    unsavedChanges = true;
}

function changeToTier(item, tierNum, pos, multi) {
    removeFromTier(item, getTierNumOf(item), multi);

    if (isMobile()) {
        addToTierMobile({data: {character: item, tierNum: tierNum}});
    } else {
        addToTier(item, tierNum, pos);
    }
}

function tierListName(event) {
    var name = event.data.tierListName;

    settings[settings.sort].tierListName = name.replace(/[^a-zA-Z0-9|!|?|,|.|+|-|*@$%^&() ]/g, "");
    $("#tier_list_caption").html(settings[settings.sort].tierListName);
    localStorage.setItem("settings", JSON.stringify(settings));
}

function validateTierName(tierName) {
    return tierName.length <= MAX_NAME_LENGTH;
}

function addTier(event) {
    var tierName = event.data.tierName, noDisplay = event.data.noDisplay, tierList = getCurrentTierList(),
        tierNum = 0;

    printMessage("");

    while (tierNum < Object.keys(tierList).length) {
        tierNum += 1;
    }

    if (tierNum >= MAX_NUMBER_OF_TIERS) {
        printMessage("<strong class='error'>Error: the number of tiers may not exceed " + MAX_NUMBER_OF_TIERS + ".</strong>");
        return;
    }

    tierName = tierName.strip().replace(/'/g, "");
    $(isMobile() ? "#tier_name_mobile" : "#tier_name").val(tierName);

    if (!tierName || tierName === "") {
        return;
    }

    if (!validateTierName(tierName)) {
        printMessage("<strong class='error'>Error: tier names may not exceed " + MAX_NAME_LENGTH +
        " characters.</strong>");
        return;
    }

    if (!noDisplay) {
        $("#tier_list_tbody").append("<tr id='tr" + tierNum + "' class='tier'>" +
        "<th id='th" + tierNum + "' class='tier_header' draggable='true'>" + tierName +
        "</th><td id='tier" + tierNum + "' class='tier_content'></td></tr><hr>");
        $("#tr" + tierNum).on("dragover dragenter", allowDrop);
        $("#tr" + tierNum).on("drop", drop);
        $("#th" + tierNum).on("click", {tierNum: tierNum}, detectLeftCtrlCombo);
        $("#th" + tierNum).on("dragstart", drag);
        $("#th" + tierNum).css("max-width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("font-size", settings[settings.sort].tierHeaderFontSize + "px");
        $("#tier" + tierNum).css("background-color", settings[settings.sort].tierListColour);

        if (isMobile()) {
            $("#th" + tierNum).css("height", "60px");
            $("#th" + tierNum).on("contextmenu", preventContextMenu);
        } else {
            $("#th" + tierNum).on("contextmenu", {tierNum: tierNum}, detectRightCtrlCombo);
        }
    }

    tierList[tierNum] = {};
    tierList[tierNum].name = tierName;
    tierList[tierNum].bg = "#1b232e";
    tierList[tierNum].colour = "#a0a0a0";
    tierList[tierNum].chars = [];
    unsavedChanges = true;
}

function moveTierTo(sourceTierNum, targetTierNum) {
    var tierList = getCurrentTierList(), tmpHtml = $("#th" + sourceTierNum).html(), tmpChars = $("#tier" + sourceTierNum).html(),
        tmp = tierList[sourceTierNum], tierNum, prevTierNum, nextTierNum, item, i;

    if (sourceTierNum > targetTierNum) {
        for (tierNum = sourceTierNum; tierNum > targetTierNum; tierNum--) {
            prevTierNum = tierNum - 1;
            $("#th" + tierNum).css("color", tierList[prevTierNum].colour);
            $("#th" + tierNum).css("background-color", tierList[prevTierNum].bg);
            $("#th" + tierNum).html($("#th" + prevTierNum).html());
            $("#tier" + tierNum).html($("#tier" + prevTierNum).html().replace(new RegExp("tier" + prevTierNum + "_", "g"), "tier" + tierNum + "_"));
            tierList[tierNum] = tierList[prevTierNum];
        }
    } else { // sourceTierNum < targetTierNum
        for (tierNum = sourceTierNum; tierNum < targetTierNum; tierNum++) {
            nextTierNum = tierNum + 1;
            $("#th" + tierNum).css("color", tierList[nextTierNum].colour);
            $("#th" + tierNum).css("background-color", tierList[nextTierNum].bg);
            $("#th" + tierNum).html($("#th" + nextTierNum).html());
            $("#tier" + tierNum).html($("#tier" + nextTierNum).html().replace(new RegExp("tier" + nextTierNum + "_", "g"), "tier" + tierNum + "_"));
            tierList[tierNum] = tierList[nextTierNum];
        }
    }

    tierList[targetTierNum] = tmp;
    $("#th" + targetTierNum).css("color", tmp.colour);
    $("#th" + targetTierNum).css("background-color", tmp.bg);
    $("#th" + targetTierNum).html(tmpHtml);
    $("#tier" + targetTierNum).html(tmpChars);
    $("#tier" + targetTierNum).html($("#tier" + targetTierNum).html().replace(new RegExp("tier" + sourceTierNum + "_", "g"), "tier" + targetTierNum + "_"));
    printMessage("");

    for (tierNum in tierList) {
        for (i in tierList[tierNum].chars) {
            item = tierList[tierNum].chars[i];
            setTieredItemEvents(item, tierNum);
        }
    }

    unsavedChanges = true;
}

function removeCharacters(tierNum, noDisplay) {
    var tierList = getCurrentTierList();

    while (tierList[tierNum].chars.length > 0) {
        removeFromTier(tierList[tierNum].chars[tierList[tierNum].chars.length - 1], tierNum, false, noDisplay);
    }

    if (!noDisplay) {
        $("#tier" + tierNum).html(""); // temporary measure against sudden double digit spans
    }
}

function removeTierEvents(tierNum) {
    $("#tr" + tierNum).off("dragover dragenter");
    $("#tr" + tierNum).off("drop");
    $("#th" + tierNum).off("click");
    $("#th" + tierNum).off("contextmenu");
    $("#th" + tierNum).off("dragstart");
}

function setTierEvents(tierNum) {
    $("#tr" + tierNum).on("dragover dragenter", allowDrop);
    $("#tr" + tierNum).on("drop", drop);
    $("#th" + tierNum).on("click", {tierNum: tierNum}, detectLeftCtrlCombo);
    $("#th" + tierNum).on("dragstart", drag);

    if (isMobile()) {
        $("#th" + tierNum).on("contextmenu", preventContextMenu);
    } else {
        $("#th" + tierNum).on("contextmenu", {tierNum: tierNum}, detectRightCtrlCombo);
    }
}

function removeTierButton(event) {
    printMessage("<strong class='confirmation'>" + getCurrentTierList()[event.data.tierNum].name + " tier removed!</strong>");
    removeTier(event.data.tierNum);
    emptyModal();
}

function removeTier(tierNum, skipConfirmation, noDisplay) {
    var tierList = getCurrentTierList(), confirmation = true, lastTierNum, i, j;

    if (tierList[tierNum].chars.length === 0) {
        skipConfirmation = true;
    }

    if (!skipConfirmation) {
        confirmation = confirm("Are you sure you want to remove this tier? This will return all characters in it to the picker.");
    }

    if (confirmation) {
        removeCharacters(Number(tierNum), noDisplay);

        for (i in tierList) {
            if (i > tierNum) {
                removeTierEvents(i - 1);
                $("#tr" + (i - 1)).html($("#tr" + i).html().replace("th" + i, "th" + (i - 1)).replace("tier" + i, "tier" + (i - 1)));
                $("#tier" + (i - 1)).html($("#tier" + (i - 1)).html().replace(new RegExp("tier" + i + "_", "g"), "tier" + (i - 1) + "_"));
                tierList[i - 1] = tierList[i];
                setTierEvents(i - 1);

                for (j in tierList[i - 1].chars) {
                    setTieredItemEvents(tierList[i - 1].chars[j], i - 1);
                }
            }
        }

        lastTierNum = Object.keys(tierList).length - 1;
        delete tierList[lastTierNum];

        if (!noDisplay) {
            $("#tr" + lastTierNum).remove();
        }
    }

    unsavedChanges = true;
    return false;
}

function emptyModal() {
    $("#modal_inner").html("");
    $("#modal_inner").css("display", "none");
    $("#modal").css("display", "none");

    if (isMobile()) {
        $(".menu").off("click");
    }
}

function closeModal(event) {
    var modal = document.getElementById("modal");

    if (event.target && event.target == modal) {
        emptyModal();
    }
}

function detectKey(event) {
    if (event.key && event.key == "Enter" && multiSelection.length > 0) {
        addMenu({ data: { name: multiSelection } });
    } else if (event.key && event.key == "Escape") {
        emptyModal();
    }
}

function quickAdd(tierNum) {
    var cats = getCurrentCategories(), categoryName, character, i;

    for (categoryName in cats) {
        if (settings.sort == "characters" && settings.categories[categoryName].enabled || settings.sort == "works" && settings.gameCategories[categoryName].enabled) {
            for (i = 0; i < cats[categoryName].chars.length; i++) {
                character = cats[categoryName].chars[i].removeSpaces();

                if (!isTiered(character)) {
                    addToTier(character, tierNum);
                }
            }
        }
    }
}

function saveSingleTierSettings(event) {
    var tierNum = event.data.tierNum,
        tierList = getCurrentTierList(),
        tierName = $("#custom_name_tier" + tierNum).val().strip().replace(/'/g, ""),
        tierBg = $("#custom_bg_tier" + tierNum).val(),
        tierColour = $("#custom_colour_tier" + tierNum).val();

    if (!allowData()) {
        return;
    }

    if (!validateTierName(tierName)) {
        $("#settings_msg_container").html("<strong class='error'>Error: tier names may not exceed " + MAX_NAME_LENGTH +
        " characters.</strong>");
        return;
    }

    $("#th" + tierNum).html(tierName);
    $("#th" + tierNum).css("background-color", tierBg);
    $("#th" + tierNum).css("color", tierColour);
    tierList[tierNum].name = tierName;
    tierList[tierNum].bg = tierBg;
    tierList[tierNum].colour = tierColour;
    settings[settings.sort].tierListName = $("#tier_list_name_menu").val().replace(/[^a-zA-Z0-9|!|?|,|.|+|-|*@$%^&() ]/g, "");
    settings[settings.sort].tierListColour = $("#tier_list_colour").val();
    settings[settings.sort].tierHeaderWidth = $("#tier_header_width").val() > defaultWidth ? $("#tier_header_width").val() : defaultWidth;
    settings[settings.sort].tierHeaderFontSize = $("#tier_header_font_size").val() != defaultSize ? $("#tier_header_font_size").val() : defaultSize;
    $(".tier_content").css("background-color", settings[settings.sort].tierListColour);
    $(".tier_header").css("width", settings[settings.sort].tierHeaderWidth + "px");
    $(".tier_header").css("max-width", settings[settings.sort].tierHeaderWidth + "px");
    $(".tier_header").css("font-size", settings[settings.sort].tierHeaderFontSize + "px");
    $("#tier_list_caption").html(settings[settings.sort].tierListName);
    $("#modal_inner").html("");
    $("#modal_inner").css("display", "none");
    $("#modal").css("display", "none");
    localStorage.setItem("settings", JSON.stringify(settings));
    saveTiersData();
}

function tierMenu(tierNum) {
    var tierList = getCurrentTierList(), otherTierNum;

    emptyModal();
    $("#modal_inner").append("<h2>Customise Tier '" + tierList[tierNum].name + "'</h2><div id='customise_tier'>");
    $("#modal_inner").append("<p class='name'><label for='custom_name_tier" + tierNum +
    "'>Name</label><input id='custom_name_tier" + tierNum + "' class='settings_input' type='text' value='" + tierList[tierNum].name +
    "'></p><p class='colour'><label for='custom_bg_tier" + tierNum +
    "'>Background Colour</label><input id='custom_bg_tier" + tierNum + "' type='color' value='" + tierList[tierNum].bg + "'>");
    $("#modal_inner").append("<label for='custom_colour_tier" + tierNum +
    "'>Text Colour</label><input id='custom_colour_tier" + tierNum + "' type='color' value='" + tierList[tierNum].colour +
    "'></p></div><hr>");
    $("#modal_inner").append("<div>Other settings (apply to all tiers):" +
    "<p><label for='tier_list_name_menu'>Tier list name (optional)</label>" +
    "<input id='tier_list_name_menu' class='settings_input' type='text' value='" + settings[settings.sort].tierListName + "'></p>" +
    "<p><label for='tier_list_colour'>Tier list colour</label>" +
    "<input id='tier_list_colour' class='settings_input' type='color' value='" + settings[settings.sort].tierListColour + "'></p>" +
    "<label for='tier_header_width'>Tier header width</label>" +
    "<input id='tier_header_width' class='settings_input' type='number' value=" + settings[settings.sort].tierHeaderWidth + " min=" + defaultWidth + "></p>" +
    "<p><label for='tier_header_font_size'>Tier header font size</label>" +
    "<input id='tier_header_font_size' class='settings_input' type='number' value=" + settings[settings.sort].tierHeaderFontSize + "></p></div>");
    $("#modal_inner").append("<div><p><input id='save_tier_settings' type='button' value='Save Changes'></p>" +
    "<p><input id='remove_tier' type='button' value='Remove This Tier'></p><p id='settings_msg_container'></p></div>");
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
    $("#save_tier_settings").on("click", {tierNum: tierNum}, saveSingleTierSettings);
    $("#remove_tier").on("click", {tierNum: tierNum}, removeTierButton);
    $(".settings_input").on("keyup", {tierNum: tierNum}, detectTiersEnter);

    for (otherTierNum in tierList) {
        if (otherTierNum == tierNum) {
            continue;
        }

        $("#tier_dropdown").append("<option value='" + otherTierNum + "'>" + tierList[otherTierNum].name + "</option>");
    }
}

function detectLeftCtrlCombo(event) {
    var tierNum = event.data.tierNum;

    if (event.ctrlKey) {
        quickAdd(tierNum);
    } else {
        tierMenu(tierNum);
    }
}

function emptyTier(tierNum) {
    var confirmation;

    if (isMobile()) {
        removeCharacters(tierNum);
    }

    confirmation = confirm("Are you sure you want to empty this tier? This will return all characters in it to the picker.");

    if (confirmation) {
        removeCharacters(tierNum);
    }
}

function detectRightCtrlCombo(event) {
    var tierNum = event.data.tierNum;

    if (event.ctrlKey) {
        emptyTier(tierNum);
    } else {
        removeTier(tierNum);
    }

    return false;
}

function storageUsed() {
    return localStorage.hasOwnProperty("settings") || localStorage.hasOwnProperty("tiers") || localStorage.hasOwnProperty("gameTiers");
}

function allowData() {
    if (!storageUsed()) {
        return confirm("This will store data in your browser's local storage. Do you allow this?");
    } else {
        return true;
    }
}

function saveTiersData() {
    localStorage.setItem("tiers", JSON.stringify(tiers));
    localStorage.setItem("gameTiers", JSON.stringify(gameTiers));
    localStorage.setItem("shotTiers", JSON.stringify(shotTiers));
    printMessage("<strong class='confirmation'>Tier list(s) saved!</strong>");
}

function saveConfirmation(event) {
    if (!allowData()) {
        return;
    }

    if (!event || !event.data) {
        saveSettingsData();
    } else if (event.data.noMenu) {
        localStorage.setItem("settings", JSON.stringify(settings));
    }

    saveTiersData();
}

function mobileInfo() {
    $("#modal_inner").html("<h3>Welcome!</h3>");
    $("#modal_inner").append("<p id='instructions_text'>This page allows you to create your own Touhou tier lists. " +
    "Currently, you can sort characters, works, and shottypes. Usage instructions are listed below.</p>" +
    "<ul id='instructions_list'><li><strong>Adding Items:</strong> Long press and drag an item into a tier box or the field.</li>" +
    "<li><strong>Moving Items:</strong> Long press and drag an item onto another item to move that item to its location.</li>" +
    "<li><strong>Multi Selection:</strong> Tap multiple items to drag them together, adding them to a tier, in your clicking order.</li>" +
    "<li><strong>Removing Items:</strong> Long press and drag an item from a tier onto the picker to remove it from that tier.</li>" +
    "<li><strong>Adding Tiers:</strong> Use the Add Tier text field and button at the top of the tier list to add a new tier.</li>" +
    "<li><strong>Moving Tiers:</strong> Long press and drag a tier onto another tier to move it to its position.</li>" +
    "<li><strong>Editing Tiers:</strong> Tap a tier to edit that tier, such as its name or background colour.</li>" +
    "<li><strong>Removing Tiers:</strong> Tap a tier and click the Remove This Tier button to remove it and all of its contents.</li></ul>");
    $("#modal_inner").append("<p>Use the buttons at the bottom of the screen to save your tier lists, " +
    "open the main menu, view these instructions, and switch between tiering characters, works, and shottypes (Switch Mode).</p>");
    $("#modal_inner").append("<p>Tap outside the window to close popup windows like this one.</p>");
}

function desktopInfo() {
    $("#modal_inner").html("<h2>Welcome!</h2>");
    $("#modal_inner").append("<p id='instructions_text'>This page allows you to create your own Touhou tier lists. " +
    "Currently, you can sort characters, works, and shottypes. Usage instructions are listed below.</p>" +
    "<ul id='instructions_list'><li><strong>Adding Items:</strong> Drag an item onto a tier box, or the field, " +
    "to add that item to it. You can also double click an item to add it to a tier, using a popup menu.</li>" +
    "<li><strong>Moving Items:</strong> Drag an item onto another item to move that item to its location. " +
    "The same double click menu that can be used in the picker can also be used for this.</li>" +
    "<li><strong>Multi Selection:</strong> Click multiple items to drag them together, adding them to a tier in your " +
    "clicking order. Alternatively, press Enter to add a selection of multiple characters to a tier, using a popup menu.</li>" +
    "<li><strong>Removing Items:</strong> Right click an item in a tier, or drag it " +
    "onto the picker, to remove it from that tier.</li><li><strong>Add All Remaining:</strong> Ctrl+Click a " +
    "tier to add all remaining items to it.</li><li><strong>Adding Tiers:</strong> Use the Add Tier text field " +
    "and button at the bottom of the tier list to add a new tier, or press Enter while in the text field.</li>" +
    "<li><strong>Moving Tiers:</strong> Drag a tier onto another tier to move it to its position.</li>" +
    "<li><strong>Editing Tiers:</strong> Click a tier to edit that tier, such as its name or background colour.</li>" +
    "<li><strong>Removing Tiers:</strong> Right click a tier to remove that tier and all of its contents. " +
    "Asks for confirmation if there are items in it.</li>" +
    "<li><strong>Emptying Tiers:</strong> Ctrl+Right Click a tier to empty it. Asks for confirmation.</li></ul>");
    $("#modal_inner").append("<p>Use the buttons at the top of the screen to save your tier lists, " +
    "import/export to text, take a screenshot, change the tier list settings, view the changelog, or reset for a new start.</p>");
    $("#modal_inner").append("<p>Click outside the window, or press Esc, to close popup windows like this one.</p>");
}

function showInformation() {
    emptyModal();
    printMessage("");

    if (isMobile()) {
        mobileInfo();
    } else {
        desktopInfo();
    }

    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function nav() {
    return "<h3>Navigation</h3>" +
    "<p><a href='scoring'><img src='assets/scoring/scoring.ico' alt='Spell Card icon'> High Score Storage</a></p>" +
    "<p><a href='survival'><img src='assets/survival/survival.ico' alt='1up Item icon'> Survival Progress Table Generator</a></p>" +
    "<p><a href='drc'><img src='assets/drc/drc.ico' alt='Power icon'> Dodging Rain Competition</a></p>" +
    "<p><a href='tools'><img src='assets/tools/tools.ico' alt='UFO icon'> Touhou Patches and Tools</a></p>" +
    "<p><a href='wr'><img src='assets/wr/wr.ico' alt='Point Item icon'> Touhou World Records</a></p>" +
    "<p><a href='lnn'><img src='assets/lnn/lnn.ico' alt='Full Power icon'> Touhou Lunatic No Miss No Bombs</a></p>" +
    "<p><a href='jargon'><img src='assets/jargon/jargon.ico' alt='Bomb icon'> Touhou Community Jargon</a></p>" +
    "<p><a href='trs'><img src='assets/trs/trs.png' alt='TRS icon'> Touhou Replay Showcase</a></p>" +
    "<p><a href='gensokyo'><img src='assets/gensokyo/gensokyo.ico' alt='Gensokyo.org icon'> Gensokyo Replay Archive</a></p>" +
    "<p><a href='pofv'><img src='assets/pofv/pofv.ico' alt='PoFV icon'> Phantasmagoria of Flower View</a></p>" +
    "<p><a href='twc'><img src='assets/twc/twc.ico' alt='TWC icon'> Touhou World Cup</a></p>" +
    "<p><a href='fangame'><img src='assets/fangame/fangame.png' alt='Tricoloured star icon'> Touhou Fangame Accomplishments</a></p>" +
    "<p><a href='thvote'><img src='assets/thvote/thvote.ico' alt='Tou kanji icon'> THWiki Popularity Poll 2020 Results Translation</a></p>" +
    "<p><a href='slots'><img src='assets/slots/slots.ico' alt='Heart icon'> Touhou Slot Machine</a></p>" +
    "<p><a href='history'><img src='assets/history/history.ico' alt='Maribel icon'> Shmup Achievement History</a></p>" +
    "<p><a href='c67'><img src='assets/c67/c67.ico' alt='Banshiryuu icon'> Seihou Banshiryuu C67</a></p>";
}

function menu() {
    emptyModal();
    $("#modal_inner").html("<h3>Menu</h3>" + $("#buttons").html().replace(/_button/g, "_button_m") + nav());
    $("#info_button_m, #save_button_m").css("display", "none");
    $("#import_button_m").on("click", importText);
    $("#export_button_m").on("click", exportText);
    $("#screenshot_button_m").on("click", takeScreenshot);
    $("#settings_button_m").on("click", settingsMenu);
    $("#changelog_button_m").on("click", changeLog);
    $("#reset_button_m").on("click", eraseAll);
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function checkSort(text) {
    if (text.join('\n').trim() === "") {
        return false;
    }

    var i, j, characters;

    for (i = 0; i < text.length; i ++) {
        if (text[i].contains(':') || text[i].contains(';')) {
            continue;
        }

        if (text[i].charAt(0) == '#') {
            continue;
        }

        if (text[i] !== "") {
            characters = text[i].split(',');

            for (j = 0; j < characters.length; j += 1) {
                if (isCharacter(characters[j].removeSpaces())) {
                    return "characters";
                } else if (isWork(characters[j].removeSpaces())) {
                    return "works";
                } else { // isShot()
                    return "shots";
                }
            }
        }
    }

    return false;
}

function clearTiers(tierList, sort, tmpSort) {
    var skipConfirmation = true, noDisplay = (sort == tmpSort ? false : true), tierNum;

    for (tierNum = Object.keys(tierList).length - 1; tierNum >= 0; tierNum--) {
        removeTier(tierNum, skipConfirmation, noDisplay);
    }
}

function parseSettings(string, sort) {
    var settingsArray = string.split(';');

    if (settingsArray.length == 3) {
        settings[sort].tierListName = settingsArray[0].replace(/[^a-zA-Z0-9|!|?|,|.|+|-|*@$%^&() ]/g, "");
        settings[sort].tierHeaderWidth = settingsArray[1];
        settings[sort].tierHeaderFontSize = settingsArray[2];
    } else {
        settings[sort].tierListName = settingsArray[0].replace(/[^a-zA-Z0-9|!|?|,|.|+|-|*@$%^&() ]/g, "");
        settings[sort].tierListColour = settingsArray[1];
        settings[sort].tierHeaderWidth = settingsArray[2];
        settings[sort].tierHeaderFontSize = settingsArray[3];
    }
}

function parseImport(text, tierList, sort, tmpSort) {
    var alreadyAdded = [], counter = -1, noDisplay = (sort == tmpSort ? false : true), characters, i, j;

    try {
        clearTiers(tierList, sort, tmpSort);

        for (i = 0; i < text.length; i++) {
            if (text[i].contains(';')) {
                parseSettings(text[i], sort);
                i += 1;
            }

            if (text[i].contains(':')) {
                addTier({data: {tierName: text[i].replace(':', ""), noDisplay: noDisplay}});
                counter += 1;
                i += 1;
            }

            if (text[i].charAt(0) == '#') {
                tierList[counter].bg = text[i].split(' ')[0];
                tierList[counter].colour = text[i].split(' ')[1];
                i += 1;
            }

            if (text[i] !== "") {
                characters = text[i].split(',');

                for (j = 0; j < characters.length; j += 1) {
                    characters[j] = characters[j].trim();

                    if (characters[j] == "Mai") {
                        characters[j] = "Mai PC-98";
                    }

                    try {
                        addToTier(characters[j].removeSpaces(), counter, noDisplay);

                        if (alreadyAdded.includes(characters[j])) {
                            throw "Item already added";
                        }

                        alreadyAdded.push(characters[j]);
                    } catch (e) {
                        tierList[counter].chars.remove(characters[j].removeSpaces());
                    }
                }
            }
        }

        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

function applyImport(tierList) {
    for (var tierNum in tierList) {
        $("#th" + tierNum).css("background-color", tierList[tierNum].bg);
        $("#th" + tierNum).css("color", tierList[tierNum].colour);
    }

    $("#modal_inner").html("");
    $("#modal").css("display", "none");
    $("#modal_inner").css("display", "none");
    $("#tier_list_caption").html(settings[settings.sort].tierListName);
    $(".tier_content").css("background-color", settings[settings.sort].tierListColour);
}

function doImport() {
    var text = $("#import").val().split('\n'), tierSort = checkSort(text), tmpSort = settings.sort, tierList;

    settings.sort = tierSort;
    tierList = getCurrentTierList();

    if (!tierSort || !parseImport(text, tierList, tierSort, tmpSort)) {
        settings.sort = tmpSort;
        $("#modal_inner").html("");
        $("#modal").css("display", "none");
        $("#modal_inner").css("display", "none");

        if (!tierSort) {
            printMessage("<strong class='error'>Error: cannot import an empty list!</strong>");
        } else {
            printMessage("<strong class='error'>Error: invalid tier list. Either there is a typo somewhere, " +
            "or this is a bug. Please contact Maribel in case of the latter.</strong>");
        }

        return;
    }

    if (tierSort == tmpSort) {
        applyImport(tierList);
    }

    settings.sort = tmpSort;
    $("#modal_inner").html("");
    $("#modal").css("display", "none");
    $("#modal_inner").css("display", "none");
    saveTiersData();
    localStorage.setItem("settings", JSON.stringify(settings));
    printMessage("<strong class='confirmation'>Tier list successfully imported!</strong>");
}

function importText() {
    emptyModal();
    printMessage("");

    if (isMobile()) {
        $("#modal_inner").html("<h3>Import from Text File</h3>");
    } else {
        $("#modal_inner").html("<h2>Import from Text File</h2>");
    }

    $("#modal_inner").append("<p>Note that the format should be the same as the exported text.</p>");
    $("#modal_inner").append("<p><strong>Warning:</strong> Importing can overwrite one of your current tier lists!");
    $("#modal_inner").append("<form target='_self' method='post' enctype='multipart/form-data'><label for='import_button'>Upload file:</label> " +
    "<input id='import_button' name='import' type='file'><p><input type='submit' value='Import'></p></form>");
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function copyToClipboard(event) {
    navigator.clipboard.writeText(event.data.text.replace(/<\/p><p>/g, "\n").strip());
    emptyModal();
    printMessage("<strong class='confirmation'>Copied to clipboard!</strong>");
}

function exportText() {
    var tierList = getCurrentTierList(), textFile = "", totalChars = 0, tierNum, character, i;

    emptyModal();
    printMessage("");

    if (isMobile()) {
        $("#modal_inner").html("<h3>Export to Text File</h3>");
    } else {
        $("#modal_inner").html("<h2>Export to Text File</h2>");
    }

    textFile += (settings[settings.sort].tierListName ? settings[settings.sort].tierListName : "-") +
    ";" + settings[settings.sort].tierListColour + ";" + settings[settings.sort].tierHeaderWidth +
    ";" + settings[settings.sort].tierHeaderFontSize;

    for (tierNum in tierList) {
        textFile += "\n" + tierList[tierNum].name + ":\n" + tierList[tierNum].bg +
        " " + tierList[tierNum].colour + "\n";

        for (i = 0; i < tierList[tierNum].chars.length; i += 1) {
            character = $("#" + tierList[tierNum].chars[i]).attr("title");
            textFile += character + (i == tierList[tierNum].chars.length - 1 ? "" : ", ");
            totalChars += 1;
        }

        textFile += "\n";
    }

    $("#modal_inner").append("<p><input id='copy_to_clipboard' type='button' value='Copy to Clipboard'></p>");
    $("#modal_inner").append("<p><a id='save_link' href='data:text/plain;charset=utf-8," + encodeURIComponent(textFile) + "' download='" + fileName("txt") + "'>" +
    "<input type='button' class='button' value='Save to Device'></a></p>");
    $("#copy_to_clipboard").on("click", {text: textFile}, copyToClipboard);

    if (totalChars === 0) {
        printMessage("<strong class='error'>Error: cannot export empty tiers.</strong>");
        $("#modal_inner").html("");
        return;
    }

    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function fileName(extension) {
    var date = new Date(),
        name = "touhou_tier_list",
        month = (date.getMonth() + 1).toLocaleString("en-US", {minimumIntegerDigits: 2}),
        day = (date.getDate()).toLocaleString("en-US", {minimumIntegerDigits: 2}),
        hours = (date.getHours()).toLocaleString("en-US", {minimumIntegerDigits: 2}),
        minutes = (date.getMinutes()).toLocaleString("en-US", {minimumIntegerDigits: 2}),
        seconds = (date.getSeconds()).toLocaleString("en-US", {minimumIntegerDigits: 2});

    if (settings[settings.sort].tierListName !== "") {
        name = settings[settings.sort].tierListName.toLowerCase().replace(/\s/g, '_');
    }

    return name + "_" + date.getFullYear() + "_" + month +
    "_" + day + "_" + hours + "_" + minutes + "_" + seconds + "." + extension;
}

/*function base64toBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]), ab = new ArrayBuffer(byteString.length), ia = new Uint8Array(ab), i;

    for (i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: "image/png"});
}

function imageToClipboard(event) {
    try {
        navigator.clipboard.write([
            new ClipboardItem({
                "image/png": base64toBlob(event.data.blob)
            })
        ]);
    } catch (e) {
        emptyModal();
        alert("Your browser does not support image to clipboard functionality. On Firefox, go to about:config and set dom.events.asyncClipboard.clipboardItem to true.");
        return;
    }
    emptyModal();
    printMessage("<strong class='confirmation'>Copied to clipboard!</strong>");
}*/

function takeScreenshot() {
    emptyModal();

    try {
        var temp = tierView;

        if (!isMobile() && !temp) {
            toggleTierView();
        }

        printMessage("<strong class='confirmation'>Girls are being screenshotted, please watch warmly...</strong>");
        html2canvas(document.body, {
            "onclone": function (doc) {
                doc.getElementsByTagName("body")[0].style.backgroundImage = "none";
                doc.getElementById("wrap").style.width = "100%";
                doc.getElementById("wrap").style.height = "auto";
                doc.getElementById("wrap").style.maxHeight = "none";
                doc.getElementById("tier_list_container").style.width = "100%";
                doc.getElementById("tier_list_container").style.height = "auto";
                doc.getElementById("tier_list_container").style.maxHeight = "none";
                doc.getElementById("tier_list_container").style.marginLeft = "0px";
            },
            "windowHeight": $("#tier_list_tbody").height() + $("#tier_list_caption").height() + 15,
            "height": $("#tier_list_tbody").height() + $("#tier_list_caption").height() + 15,
            "logging": false,
            "scrollX": 0,
            "scrollY": 0
        }).then(function(canvas) {
            var base64image = canvas.toDataURL("image/png");

            if (isMobile()) {
                $("#modal_inner").append("<h3>Screenshot</h3>");
            } else {
                $("#modal_inner").append("<h2>Screenshot</h2>");

                if (!temp) {
                    toggleTierView();
                }
            }

            $("#modal_inner").append("<p><a id='save_link' href='" + base64image + "' download='" + fileName("png") + "'>" +
            "<input type='button' class='button' value='Save to Device'></a></p>" +
            //"<p><input id='clipboard' type='button' class='button' value='Copy to Clipboard'></p>" +
            "<p><img id='screenshot_base64' src='" + base64image + "' alt='Tier list screenshot'></p>");
            //$("#clipboard").on("click", {blob: base64image}, imageToClipboard);
            $("#modal_inner").css("display", "block");
            $("#modal").css("display", "block");
            printMessage("");
        });
    } catch (e) {
        printMessage("<strong class='error'>Error: your browser is outdated. Use a different browser " +
        "to screenshot your tier list.</strong>");
    }
}

function settingsMenuChars() {
    var categoryName, current = 0, counter = 0;

    $("#modal_inner").append("<div>Include characters in the following works of first appearance:" +
    "<table id='settings_table'><tbody><tr id='settings_tr0'>");

    for (categoryName in categories) {
        if (counter > 0 && counter % 5 === 0) {
            counter = 0;
            current += 1;
            $("#settings_table").append("</tr><tr id='settings_tr" + current + "'>");
        }

        $("#settings_tr" + current).append("<td><input id='checkbox_" + categoryName +
        "' type='checkbox'" + (settings.categories[categoryName].enabled ? " checked" : "") +
        "><label for='" + categoryName + "'>" + categoryName + "</label></td>");
        counter += 1;
    }

    $("#modal_inner").append("</tr></tbody></table>");
    $("#modal_inner").append("<p><label for='pc-98'>PC-98</label><input id='pc98' type='checkbox'" +
    " " + (settings.pc98Enabled ? " checked" : "") + " " + "></p>");
    $("#pc98").on("click", togglePC98);
    $("#modal_inner").append("<p><label for='windows'>Windows</label><input id='windows' type='checkbox'" +
    " " + (settings.windowsEnabled ? " checked" : "") + "></p>");
    $("#windows").on("click", toggleWindows);
    $("#modal_inner").append("<p><label for='male'>Male Characters</label><input id='male' type='checkbox'" +
    " " + (settings.maleEnabled ? " checked" : "") + " " + "></p></div>");
    $("#pc98").on("click", toggleMale);
}

function settingsMenuOther() {
    var cats = getCurrentCategories(), categoryName, current = 0, counter = 0;

    $("#modal_inner").append("Include " + settings.sort + " in the following categories:" +
    "<table id='settings_table'><tbody><tr id='settings_tr0'>");

    for (categoryName in cats) {
        if (counter > 0 && counter % 5 === 0) {
            counter = 0;
            current += 1;
            $("#settings_table").append("</tr><tr id='settings_tr" + current + "'>");
        }

        $("#settings_tr" + current).append("<td><input id='checkbox_" + categoryName +
        "' type='checkbox'" + (getCurrentCategorySettings()[categoryName].enabled ? " checked" : "") +
        "><label for='" + categoryName + "'>" + categoryName + "</label></td>");
        counter += 1;
    }
    $("#modal_inner").append("</tr></tbody></table>");
}

function settingsMenu() {
    emptyModal();

    if (isMobile()) {
        $("#modal_inner").html("<h3>Settings</h3>");
    } else {
        $("#modal_inner").html("<h2>Settings</h2>");
    }

    if (settings.sort == "characters") {
        settingsMenuChars();
    } else { // "works" or "shots"
        settingsMenuOther();
    }

    printMessage("");
    $("#modal_inner").append("<div>Other settings:<p><label for='tier_list_name_menu'>Tier list name (optional)</label>" +
    "<input id='tier_list_name_menu' class='settings_input' type='text' value='" + settings[settings.sort].tierListName + "'></p>" +
    "<p><label for='tier_list_colour'>Tier list colour</label>" +
    "<input id='tier_list_colour' class='settings_input' type='color' value='" + settings[settings.sort].tierListColour + "'></p>" +
    "<label for='tier_header_width'>Tier header width</label>" +
    "<input id='tier_header_width' class='settings_input' type='number' value=" + settings[settings.sort].tierHeaderWidth +
    " min=" + defaultWidth + "></p><p><label for='tier_header_font_size'>Tier header font size</label>" +
    "<input id='tier_header_font_size' class='settings_input' type='number' value=" + settings[settings.sort].tierHeaderFontSize +
    "></p><p>To customise a tier's name and colour, click it in your tier list.</p></div>");
    $("#modal_inner").append("<div><p><input id='save_settings' type='button' value='Save Changes'></p>" +
    "<p id='settings_msg_container'></p></div>");
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
    $("#save_settings").on("click", saveConfirmation);
    $(".settings_input").on("keyup", detectSettingsEnter);
}

function massRemoval(removedCategories) {
    var cats = getCurrentCategories(), categoryName, character, i, j;

    $("#settings_msg_container").html("<strong class='error'>Girls are being removed, please wait warmly...</strong>");

    for (i = 0; i < removedCategories.length; i++) {
        categoryName = removedCategories[i];

        if (isCategory(categoryName)) {
            for (j in cats[categoryName].chars) {
                character = cats[categoryName].chars[j].removeSpaces();

                if (isTiered(character)) {
                    removeFromTier(character, getTierNumOf(character));
                }
            }
        } else {
            character = categoryName;
            removeFromTier(character, getTierNumOf(character));
        }
    }
}

function togglePC98() {
    for (var i = 0; i < pc98.length; i++) {
        $("#checkbox_" + pc98[i]).prop("checked", $("#pc98").is(":checked") ? true : false);
    }
}

function toggleWindows() {
    for (var i = 0; i < windows.length; i++) {
        $("#checkbox_" + windows[i]).prop("checked", $("#windows").is(":checked") ? true : false);
    }
}

function toggleMale() {
    $("#checkbox_Soku").prop("checked", $("#male").is(":checked") ? true : false);
}

function saveSettingsData() {
    var cats = getCurrentCategories(), removedCategories = [], categoryName, item, confirmation, i;

    for (categoryName in cats) {
        if (settings.sort == "characters") {
            settings.categories[categoryName].enabled = $("#checkbox_" + categoryName).is(":checked");
        } else if (settings.sort == "works") {
            settings.gameCategories[categoryName].enabled = $("#checkbox_" + categoryName).is(":checked");
        } else { // settings.sort == "shots"
            settings.shotCategories[categoryName].enabled = $("#checkbox_" + categoryName).is(":checked");
        }

        if (!$("#checkbox_" + categoryName).is(":checked")) {
            for (i = 0; i < cats[categoryName].chars.length; i++) {
                item = cats[categoryName].chars[i].removeSpaces();

                if (isTiered(item)) {
                    removedCategories.push(categoryName);
                }
            }
        }

        unsavedChanges = true;
    }

    if (settings.sort == "characters" && !$("#male").is(":checked")) {
        for (i in maleCharacters) {
            if (isTiered(maleCharacters[i])) {
                removedCategories.push(maleCharacters[i]);
            }
        }
    }

    if (removedCategories.length > 0) {
        confirmation = confirm("This will remove characters from disabled categories from the current tiers. " +
        "Are you sure you want to do that?");

        if (isMobile() || confirmation) {
            massRemoval(removedCategories);
        } else {
            return;
        }
    }

    for (categoryName in cats) {
        if ($("#checkbox_" + categoryName).is(":checked") && !allTiered(categoryName)) {
            $("#" + categoryName).css("display", "block");
        } else {
            $("#" + categoryName).css("display", "none");
        }
    }

    if (settings.sort == "characters") {
        settings.pc98Enabled = $("#pc98").is(":checked");
        settings.windowsEnabled = $("#windows").is(":checked");
        settings.maleEnabled = $("#male").is(":checked");

        for (i in maleCharacters) {
            $("#" + maleCharacters[i]).css("display", settings.maleEnabled ? "inline-block" : "none");
        }
    }

    settings[settings.sort].tierListName = $("#tier_list_name_menu").val().replace(/[^a-zA-Z0-9|!|?|,|.|+|-|*@$%^&() ]/g, "");
    settings[settings.sort].tierListColour = $("#tier_list_colour").val();
    settings[settings.sort].tierHeaderWidth = $("#tier_header_width").val() > defaultWidth ? $("#tier_header_width").val() : defaultWidth;
    settings[settings.sort].tierHeaderFontSize = $("#tier_header_font_size").val() != defaultSize ? $("#tier_header_font_size").val() : defaultSize;
    $(".tier_header").css("width", settings[settings.sort].tierHeaderWidth + "px");
    $(".tier_header").css("max-width", settings[settings.sort].tierHeaderWidth + "px");
    $(".tier_header").css("font-size", settings[settings.sort].tierHeaderFontSize + "px");
    $(".tier_content").css("background-color", settings[settings.sort].tierListColour);
    $("#tier_list_caption").html(settings[settings.sort].tierListName);
    $("#modal_inner").html("");
    $("#modal_inner").css("display", "none");
    $("#modal").css("display", "none");
    localStorage.setItem("settings", JSON.stringify(settings));
    printMessage("<strong class='confirmation'>Settings saved!</strong>");
}

function toggleTierView() {
    printMessage("");
    $("#characters").css("display", tierView ? "block" : "none");
    $("#toggle_picker").css("display", tierView ? "inline" : "none");
    tierView = !tierView;
    $("#toggle_view").val(tierView ? "Normal View" : "Tier List View");
    $("#wrap").css("width", tierView ? "auto" : (smallPicker ? "65%" : "45%"));
    $("#wrap").css("bottom", tierView ? "5px" : "");
    $("#wrap").css("left", tierView ? "5px" : "");
    $("#wrap").css("border", tierView ? "none" : "1px solid #000");
    $("body").css("background", tierView ? "#1b232e" : "url('assets/tiers/tiers.jpg') center no-repeat fixed");
    $("body").css("background-size", tierView ? "default" : "cover");
}

function togglePickerSize() {
    smallPicker = !smallPicker;
    $("#wrap").css("width", smallPicker ? "65%" : "45%");
    $("#characters").css("width", smallPicker ? "31%" : "51%");
    $("#toggle_picker").val(smallPicker ? "Large Picker" : "Small Picker");

    if (smallPicker) {
        settings.picker = "small";
    } else {
        delete settings.picker;
    }

    saveConfirmation({data: {noMenu: true}});
    printMessage("");
}

function changeLog() {
    emptyModal();
    printMessage("");

    if (isMobile()) {
        $("#modal_inner").html("<h3>Changelog</h3>");
    } else {
        $("#modal_inner").html("<h2>Changelog</h2>");
    }

    $("#modal_inner").append("<ul class='left'><li>05/12/2018: Initial release</li>" +
    "<li>05/12/2018: Dairi art added and made the default; PC-98 and male characters added</li>" +
    "<li>21/01/2019: Mobile version</li>" +
    "<li>24/04/2019: Works added</li>" +
    "<li>18/08/2019: Migrated to maribelhearn.com</li>" +
    "<li>17/09/2019: Mobile version bugs fixed and speed increased; changelog added</li>" +
    "<li>04/10/2019: WBaWC characters added</li>" +
    "<li>19/12/2019: Fixed character disappearance bug and related issues</li>" +
    "<li>02/01/2020: Fixed tier list loading bug</li>" +
    "<li>13/03/2020: Fixed bug caused by swapping tiers as well as a bug caused by naming a tier after a character</li>" +
    "<li>06/04/2020: Added ability to change the tier header font size and made tier header width changes apply immediately</li>" +
    "<li>06/09/2020: Miyoi Okunoda added</li>" +
    "<li>23/09/2020: Screenshotting added, only working on Firefox</li>" +
    "<li>26/06/2021: UM characters added</li>" +
    "<li>18/07/2021: Screenshotting fixed, works on all modern browsers</li>" +
    "<li>20/07/2021: Shottypes added</li>" +
    "<li>06/11/2021: Yuuma Toutetsu added</li>" +
    "<li>01/01/2022: Import and export to text now uses files</li></ul>");
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function eraseAllConfirmed() {
    var tierList = getCurrentTierList(), tmp;

    clearTiers(tierList, settings.sort, settings.sort);
    tiers = {};
    gameTiers = {};
    shotTiers = {};
    tmp = settings.sort;
    settings = {
        "categories": {
            "Main": { enabled: true }, "HRtP": { enabled: true }, "SoEW": { enabled: true }, "PoDD": { enabled: true },
            "LLS": { enabled: true }, "MS": { enabled: true }, "EoSD": { enabled: true }, "PCB": { enabled: true },
            "IN": { enabled: true }, "PoFV": { enabled: true }, "MoF": { enabled: true }, "SA": { enabled: true },
            "UFO": { enabled: true }, "TD": { enabled: true }, "DDC": { enabled: true }, "LoLK": { enabled: true },
            "HSiFS": { enabled: true }, "WBaWC": { enabled: true }, "UM": { enabled: true }, "Spinoff": { enabled : true },
            "Manga": { enabled: true }, "CD": { enabled: true }
        },
        "gameCategories": {
            "PC-98": { enabled: true }, "Classic": { enabled: true }, "Modern1": { enabled: true }, "Modern2": { enabled: true },
            "Mangas": { enabled: true }, "Books": { enabled: true }, "CDs": { enabled: true }
        },
        "shotCategories": {
            "SoEW": { enabled : true }, "PoDD": { enabled : true }, "LLS": { enabled : true }, "MS": { enabled : true },
            "EoSD": { enabled: true }, "PCB": { enabled: true }, "IN": { enabled: true }, "PoFV": { enabled: true },
            "MoF": { enabled: true }, "SA": { enabled: true }, "UFO": { enabled: true }, "TD": { enabled: true },
            "DDC": { enabled: true }, "LoLK": { enabled: true }, "HSiFS": { enabled: true }, "WBaWC": { enabled: true },
            "UM": { enabled: true }
        },
        "characters": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "works": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "shots": {
            "tierListName": "",
            "tierListColour": defaultColour,
            "tierHeaderWidth": defaultWidth,
            "tierHeaderFontSize": defaultSize
        },
        "pc98Enabled": true,
        "windowsEnabled": true,
        "maleEnabled": true,
        "sort": tmp
    };
    localStorage.removeItem("tiers");
    localStorage.removeItem("gameTiers");
    localStorage.removeItem("shotTiers");
    localStorage.removeItem("settings");
    initialise();
    printMessage("<strong class='confirmation'>Reset the tier list and settings to their default states!</strong>");
    unsavedChanges = false;
}

function modalEraseAll() {
    eraseAllConfirmed();
    emptyModal();
}

function modalEraseSingle() {
    var i;

    clearTiers(getCurrentTierList(), settings.sort, settings.sort);

    for (i = 0; i < defaultTiers.length; i++) {
        addTier({data: {tierName: defaultTiers[i]}});
    }

    emptyModal();
}

function eraseAll() {
    emptyModal();
    $("#modal_inner").html("<h3>Reset</h3><p>Are you sure you want to reset your tier lists and settings to the defaults? " +
    "<strong>Erase All</strong> will permanently erase all of your loaded tier lists and settings.</p>" +
    "<p><strong>Erase Current Tier List</strong> will only erase the tier list that is currently open.</p>");
    $("#modal_inner").append("<p><input id='erase_all_button' class='mobile_button' type='button' value='Erase All'></p>");
    $("#modal_inner").append("<p><input id='erase_single_button' class='mobile_button' type='button' value='Erase Current Tier List'></p>");
    $("#modal_inner").append("<p><input id='cancel_button' class='mobile_button' type='button' value='Cancel'></p>");
    $("#erase_all_button").on("click", modalEraseAll);
    $("#erase_single_button").on("click", modalEraseSingle);
    $("#cancel_button").on("click", emptyModal);
    $("#modal_inner").css("display", "block");
    $("#modal").css("display", "block");
}

function drag(event) {
    event.dataTransfer = event.originalEvent.dataTransfer;
    event.dataTransfer.setData("text/plain", event.target.id);
    following = event.target.id;
}

function allowDrop(event) {
    event.preventDefault();
}

function preventContextMenu(event) {
    event.preventDefault();
}

function tierOntoTier(tierNum) {
    if (following.substring(0, 2) != tierNum) {
        moveTierTo(Number(following.replace("th", "")), tierNum);
    }
}

function itemOntoTier(tierNum) {
    if (multiSelection.length > 0 && multiSelection.contains(following)) {
        addMultiSelection(tierNum);
    } else {
        if (isTiered(following)) {
            changeToTier(following, tierNum);
        } else {
            addToTier(following, tierNum);
        }
    }
}

function dropOntoTier(event) {
    var tierNum = Number(event.target.id.replace("th", "").replace("tier", "").replace(/_\d+/, ""));

    if (following.substring(0, 2) == "th") {
        tierOntoTier(tierNum);
    } else {
        itemOntoTier(tierNum);
    }
}

function itemOntoTieredItem(event) {
    if (isTiered(following)) {
        if (getTierNumOf(following) === getTierNumOf(event.target.id)) {
            if (multiSelection.length > 0) {
                moveMultiSelectionTo(event.target.id);
            } else {
                moveItemTo(following, event.target.id);
            }
        } else {
            if (multiSelection.length > 0) {
                changeMultiSelectionTo(getTierNumOf(event.target.id), getPositionOf(event.target.id));
            } else {
                changeToTier(following, getTierNumOf(event.target.id), getPositionOf(event.target.id));
            }
        }
    } else {
        addToTier(following, getTierNumOf(event.target.id), getPositionOf(event.target.id));
    }
}

function tieredItemOntoPicker() {
    if (multiSelection.length > 0) {
        removeMultiSelection();
    } else {
        removeFromTier(following, getTierNumOf(following));
    }
}

function drop(event) {
    event.preventDefault();

    if (event.target.id.substring(0, 2) === "th" || event.target.id.substring(0, 4) === "tier") {
        dropOntoTier(event);
    } else if (isTiered(event.target.id) && following.substring(0, 2) != "th") {
        itemOntoTieredItem(event);
    } else if ((isItem(event.target.id) || isCategory(event.target.id) || event.target.id === "characters") && isTiered(following)) {
        tieredItemOntoPicker();
    }

    following = "";
}

function deleteLegacyCookies() {
    if (getCookie("settings")) {
        localStorage.setItem("settings", getCookie("settings"));
        deleteCookie("settings");
    }

    if (getCookie("tiers")) {
        localStorage.setItem("tiers", getCookie("tiers"));
        deleteCookie("tiers");
    }

    if (getCookie("order")) {
        localStorage.setItem("order", getCookie("order"));
        deleteCookie("order");
    }

    if (getCookie("gameTiers")) {
        localStorage.setItem("gameTiers", getCookie("gameTiers"));
        deleteCookie("gameTiers");
    }

    if (getCookie("gameOrder")) {
        localStorage.setItem("gameOrder", getCookie("gameOrder"));
        deleteCookie("gameOrder");
    }

    localStorage.removeItem("order");
    localStorage.removeItem("gameOrder");
    localStorage.removeItem("shotOrder");
}

function loadCategories() {
    var chars = $("#chars_load").children(), works = $("#works_load").children(), shots = $("#shots_load").children(),
        val, i, j;

    for (i = 0; i < chars.length; i++) {
        val = chars[i].value.split(',');
        categories[chars[i].id] = {"chars": []};

        for (j = 0; j < val.length; j++) {
            categories[chars[i].id].chars.push(val[j]);
        }
    }

    for (i = 0; i < works.length; i++) {
        val = works[i].value.split(',');
        gameCategories[works[i].id] = {"chars": []};

        for (j = 0; j < val.length; j++) {
            gameCategories[works[i].id].chars.push(val[j]);
        }
    }

    for (i = 0; i < shots.length; i++) {
        val = shots[i].value.split(',');
        shotCategories[shots[i].id] = {"chars": []};

        for (j = 0; j < val.length; j++) {
            shotCategories[shots[i].id].chars.push(val[j]);
        }
    }
}

function loadTier(tiersData, tierNum, tierSort) {
    var tierList = getCurrentTierList(tierSort), item, i;

    tierList[tierNum] = {};
    tierList[tierNum].name = tiersData[tierNum].name;
    tierList[tierNum].bg = tiersData[tierNum].bg;
    tierList[tierNum].colour = tiersData[tierNum].colour;
    tierList[tierNum].chars = [];

    if (tierSort == settings.sort) {
        $("#tier_list_tbody").append("<tr id='tr" + tierNum + "' class='tier'><th id='th" + tierNum +
        "' class='tier_header' draggable='true'>" + tiersData[tierNum].name + "</th><td id='tier" + tierNum +
        "' class='tier_content'></td></tr>");
        $("#tr" + tierNum).on("dragover dragenter", allowDrop);
        $("#tr" + tierNum).on("drop", drop);
        $("#th" + tierNum).on("click", {tierNum: tierNum}, detectLeftCtrlCombo);
        $("#th" + tierNum).on("dragstart", drag);
        $("#th" + tierNum).css("background-color", tierList[tierNum].bg);
        $("#th" + tierNum).css("color", tierList[tierNum].colour);
        $("#th" + tierNum).css("max-width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("width", settings[settings.sort].tierHeaderWidth + "px");
        $("#th" + tierNum).css("font-size", settings[settings.sort].tierHeaderFontSize + "px");

        if (isMobile()) {
            $("#th" + tierNum).css("height", "60px");
            $("#th" + tierNum).on("contextmenu", preventContextMenu);
        } else {
            $("#th" + tierNum).on("contextmenu", {tierNum: tierNum}, detectRightCtrlCombo);
        }

        for (i = 0; i < tiersData[tierNum].chars.length; i++) {
            item = tiersData[tierNum].chars[i];

            if (item == "Mai") {
                item = "Mai PC-98";
            }

            if (isMobile()) {
                $("#" + item).off("click");
            }

            addToTier(item, tierNum);
        }
    } else {
        for (i = 0; i < tiersData[tierNum].chars.length; i++) {
            item = tiersData[tierNum].chars[i];

            if (item == "Mai") {
                item = "Mai PC-98";
            }

            if (isMobile()) {
                $("#" + item).off("click");
            }

            tierList[tierNum].chars.pushStrict(item);
        }
    }
}

function loadTiersFromStorage() {
    var tiersData = JSON.parse(localStorage.getItem("tiers")),
        gameTiersData = JSON.parse(localStorage.getItem("gameTiers")),
        shotTiersData = JSON.parse(localStorage.getItem("shotTiers")),
        tmp = settings.sort, tierNum, i;

    if (tiersData && !tiersData.isEmpty()) {
        for (tierNum in tiersData) {
            tierNum = Number(tierNum);
            loadTier(tiersData, tierNum, "characters");
        }
    } else {
        settings.sort = "characters";

        for (i = 0; i < defaultTiers.length; i++) {
            addTier({data: {tierName: defaultTiers[i], noDisplay: tmp != "characters"}});
        }
    }

    if (gameTiersData && !gameTiersData.isEmpty()) {
        for (tierNum in gameTiersData) {
            tierNum = Number(tierNum);
            loadTier(gameTiersData, tierNum, "works");
        }
    } else {
        settings.sort = "works";

        for (i = 0; i < defaultTiers.length; i++) {
            addTier({data: {tierName: defaultTiers[i], noDisplay: tmp != "works"}});
        }
    }

    if (shotTiersData && !shotTiersData.isEmpty()) {
        for (tierNum in shotTiersData) {
            tierNum = Number(tierNum);
            loadTier(shotTiersData, tierNum, "shots");
        }
    } else {
        settings.sort = "shots";

        for (i = 0; i < defaultTiers.length; i++) {
            addTier({data: {tierName: defaultTiers[i], noDisplay: tmp != "shots"}});
        }
    }

    settings.sort = tmp;
}

function loadItems() {
    var cats = getCurrentCategories(), categoryName, item, i;

    for (categoryName in cats) {
        $("#characters").append("<div id='" + categoryName + "' class='dark_bg'>");

        for (i in cats[categoryName].chars) {
            item = cats[categoryName].chars[i].replace("'", "");
            $("#" + categoryName).append("<span id='" + item.removeSpaces() +
            "C'><span id='" + item.removeSpaces() + "' class='item list_" + settings.sort + getSpritesheetOf(item, categoryName) +
            "' draggable='true' " + "alt='" + item + "' title='" + item + "'>");
            setPickerItemEvents(item);
        }

        $("#characters").append("</div>");

        if (settings.sort == "characters" && !settings.categories[categoryName].enabled) {
            $("#" + categoryName).css("display", "none");
        } else if (settings.sort == "works" && !settings.gameCategories[categoryName].enabled) {
            $("#" + categoryName).css("display", "none");
        } else if (settings.sort == "shots" && !settings.shotCategories[categoryName].enabled) {
            $("#" + categoryName).css("display", "none");
        }
    }
}

function loadSettingsFromStorage() {
    var settingsData = JSON.parse(localStorage.getItem("settings")), category, sort, i;

    if (settingsData.hasOwnProperty("categories")) {
        for (category in settingsData.categories) {
            if (spinoffs.contains(category)) {
                settings.categories["Spinoff"].enabled = settingsData.categories[category].enabled;
            } else {
                settings.categories[category].enabled = settingsData.categories[category].enabled;
            }
        }

        if (settingsData.hasOwnProperty("gameCategories")) {
            for (category in settingsData.gameCategories) {
                if (category == "Manga") { // fix legacy manga
                    settings.gameCategories["Mangas"] = settingsData.gameCategories[category];
                    continue;
                }

                settings.gameCategories[category].enabled = settingsData.gameCategories[category].enabled;
            }
        }

        if (settingsData.hasOwnProperty("shotCategories")) {
            for (category in settingsData.shotCategories) {
                if (!settings.shotCategories[category]) {
                    settings.shotCategories[category] = { enabled : true };
                }

                settings.shotCategories[category].enabled = settingsData.shotCategories[category].enabled;
            }
        }

        for (i = 0; i < sorts.length; i++) {
            sort = sorts[i];
            settings[sort].tierListName = (settingsData[sort] && settingsData[sort].tierListName ? settingsData[sort].tierListName : "");
            settings[sort].tierListColour = (settingsData[sort] && settingsData[sort].tierListColour ? settingsData[sort].tierListColour : defaultColour);
            settings[sort].tierHeaderWidth = (settingsData[sort] && settingsData[sort].tierHeaderWidth ? settingsData[sort].tierHeaderWidth : defaultWidth);
            settings[sort].tierHeaderFontSize = (settingsData[sort] && settingsData[sort].tierHeaderFontSize ? settingsData[sort].tierHeaderFontSize : defaultSize);
        }

        if (settingsData.picker && settingsData.picker == "small") {
            togglePickerSize();
        }

        settings.pc98Enabled = settingsData.pc98Enabled;
        settings.windowsEnabled = settingsData.windowsEnabled;
        settings.maleEnabled = settingsData.maleEnabled;
        settings.sort = settingsData.sort;
    } else {
        for (category in settingsData) {
            if (category == "Other") {
                settings.categories["Manga"].enabled = settingsData[category].enabled;
                settings.categories["CD"].enabled = settingsData[category].enabled;
            } else {
                settings.categories[category].enabled = settingsData[category].enabled;
            }
        }
    }
}

function setAddTierListeners() {
    $("#add_tier, #add_tier_mobile, #add_tier_list_name").off("click");
    $("#add_tier").on("click", {tierName: $("#tier_name").val()}, addTier);
    $("#add_tier_mobile").on("click", {tierName: $("#tier_name_mobile").val()}, addTier);
    $("#add_tier_mobile").on("click", {tierName: $("#tier_name_mobile").val()}, addTier);
    $("#add_tier_list_name").on("click", {tierListName: $("#tier_list_name").val()}, tierListName);
}

function detectTierListNameEnter(event) {
    if (event.key && event.key == "Enter") {
        tierListName({data: {tierListName: $("#tier_list_name").val()}});
    } else {
        setAddTierListeners();
    }
}

function detectAddTierEnter(event) {
    if (event.key && event.key == "Enter") {
        addTier({data: {tierName: $(isMobile() ? "#tier_name_mobile" : "#tier_name").val()}});
    } else {
        setAddTierListeners();
    }
}

function detectSettingsEnter(event) {
    if (event.key && event.key == "Enter") {
        saveConfirmation();
    }
}

function detectTiersEnter(event) {
    if (event.key && event.key == "Enter") {
        saveSingleTierSettings(event);
    }
}

function setEventListeners() {
    setAddTierListeners();
    $("body").on("click", closeModal);
    $("body").on("keyup", detectKey);
    $("#sort").on("change", switchSort);
    $("#toggle_view").on("click", toggleTierView);
    $("#toggle_picker").on("click", togglePickerSize);
    $("#info_button").on("click", showInformation);
    $("#tier_name, #tier_name_mobile").on("keyup", detectAddTierEnter);
    $("#tier_list_name").on("keyup", detectTierListNameEnter);
    $("#save_button").on("click", {noMenu: true}, saveConfirmation);
    $("#import_button").on("click", importText);
    $("#export_button").on("click", exportText);
    $("#screenshot_button").on("click", takeScreenshot);
    $("#settings_button").on("click", settingsMenu);
    $("#changelog_button").on("click", changeLog);
    $("#reset_button").on("click", eraseAll);
    $("#information_button").on("click", showInformation);
    $("#save_button_mobile").on("click", {noMenu: true}, saveConfirmation);
    $("#menu_button").on("click", menu);
    $("#switch_button").on("click", switchSort);
    $("#characters").on("dragover dragenter", allowDrop);
    $("#characters").on("drop", drop);
    window.onbeforeunload = function () {
        if (unsavedChanges) {
            return "";
        }

        return undefined;
    }
}

$(document).ready(function () {
    deleteLegacyCookies();

    if (localStorage.settings) {
        loadSettingsFromStorage();
    } else if (!localStorage.tiers && !localStorage.gameTiers && !localStorage.shotTiers) {
        showInformation();
    }

    loadCategories();
    $("#tier_list_caption").html(settings[settings.sort].tierListName);
    $("#chars_load, #works_load, #shots_load").remove();
    $("#sort").val(settings.sort);
    loadItems();

    if (localStorage.tiers || localStorage.gameTiers || localStorage.shotTiers) {
        loadTiersFromStorage();
    } else {
        initialise();
    }

    if ($("#import").length) {
        doImport();
        $("#import").remove();
    } else if ($("#error").length) {
        printMessage($("#error").val());
        $("#error").remove();
    }

    $(".tier_content").css("background-color", settings[settings.sort].tierListColour);
    setEventListeners();
    unsavedChanges = false;
});
