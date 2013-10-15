var timers = {};
var groups = {};

function addTriggers(timerID) {
  $("#trigger-opts-timer" + timerID).html('');
  var triggersStr = '<option selected disabled value="default">Select Timer</option>';
  $.each(Object.keys(groups), function(){
    triggersStr = triggersStr.concat("<optgroup label='Group " + (this + 1) + "'>");
    var timersArray = groups[this];
    if (timersArray.length > 0) {
      $.each(timersArray, function() {
        var _this = this;
        if (this.timerID != timerID) {
          triggersStr = triggersStr.concat("<option value='" + this.timerID + "'>" + this.timerName + "</option>");
        }
        else {
          triggersStr = triggersStr.concat("<option value='" + this.timerID + "'disabled>" + this.timerName + "</option>"); 
        }
      });
    }
    triggersStr = triggersStr.concat("</optgroup>");
  });
  $("#trigger-opts-timer" + timerID).html(triggersStr);
}

function refreshTrigger(timerID) {
  var triggerOpts = $('#timer-row' + timerID).find('.trigger-opts-timer');
  var selectedTriggerOpt = $('#timer-row' + timerID).find('.trigger-opts-timer :selected');
  addTriggers(timerID);
  if (Object.keys(timers).indexOf(selectedTriggerOpt.val()) > -1) {
    $(triggerOpts).val(selectedTriggerOpt.val());
  }
}

function refreshAllTriggers() {
  $.each(timers, function() {
    refreshTrigger(this.timerID);
  });
}

function relocateVisibleTimerPopups() {
  $.each($('.timer-popup:visible'), function() {
    var timerID = this.getAttribute('id').substring('timer-popup'.length);
    offset = $('#timer' + timerID).offset();
    $('#timer-popup' + timerID).offset({top: offset.top + 55, left: offset.left - 40});
  });
}

function relocateVisibleNamePopups() {
  $.each($('.name-popup:visible'), function() {
    var timerID = this.getAttribute('id').substring('name-popup'.length);
    offset = $('#timer-row' + timerID + ' .timer-name-cell').offset();
    $('#name-popup' + timerID).offset({top: offset.top + 55, left: offset.left - 10});
  });
}

function clearFields(fields) {
  $.each(fields, function() {
    this.val('');
  })
}

function getTimerFields(obj) {
  var hoursField = obj.find('.hours-field');
  var minsField = obj.find('.mins-field');
  var secsField = obj.find('.secs-field');
  return [hoursField, minsField, secsField];
}

function getTimerLength(obj) {
  var timerFields = getTimerFields(obj);
  var hoursField = timerFields[0];
  var minsField = timerFields[1];
  var secsField = timerFields[2];

  // Get length of timer in seconds
  var MAX_LENGTH = 9007199254740992;
  var hours = parseInt(hoursField.val());
  var mins = parseInt(minsField.val());
  var secs = parseInt(secsField.val());
  var cdLength = 0;

  if (!isNaN(hours) && typeof hours == 'number') {
    cdLength += hours * 36000;
  }
  if (!isNaN(mins) && typeof mins == 'number') {
    cdLength += mins * 600;
  }
  if (!isNaN(secs) && typeof secs == 'number') {
    cdLength += secs * 10;
  }

  if (MAX_LENGTH < cdLength) {
    return false;
  }

  // Make sure timer fields aren't empty
  if (cdLength <= 0 || (hoursField.val() == '' && minsField.val() == '' && secsField.val() == '')) {
    return false;
  }

  return cdLength;
}

function checkCDLength(cdLength, obj) {
  if (cdLength == false) {
    obj.addClass('has-error');
    return false;
  }
  else {
    obj.removeClass('has-error');
    return true;
  }
}

function addTimer() {
  var parent = $(this).parent();
  var ggparent = $(this).parents().eq(2);
  var groupID = ggparent.prop('id').substring('timer-group'.length);

  var nameField = parent.find('.name-field');

  var timerName = nameField.val().trim();
  var cdLength = getTimerLength(parent);

  if (timerName == '' || timerName == null) {
    nameField.parent().addClass('has-error');
    checkCDLength(cdLength, parent.find('.timer-fields'));
    return;
  }
  else {
    nameField.parent().removeClass('has-error');
  }

  if (!checkCDLength(cdLength, parent.find('.timer-fields'))) {
    return;
  }

  // Clear timer entry fields
  clearFields(getTimerFields(parent));
  nameField.val('');

  // Find lowest possible timer ID to use
  var timerID = 0;
  var timerIDs = Object.keys(timers);
  while (timerIDs.indexOf(String(timerID)) > -1) {
    timerID++;
  }

  // Add new html element
  var table = ggparent.find('.table tbody');
  table.append("\
    <tr class='timer-row' id='timer-row" + timerID + "'>\
      <td class='sfx-cell'><audio class='sfx-ding'><source src='ding.mp3' type='audio/mpeg'></audio></td>\
      <td class='timer-name-cell'>\
        <div class='timer-name-div cell-div'><span class='timer-name'>" + timerName + "</span></div>\
      </td>\
      <td class='timer' id='timer" + timerID + "'><div class='cell-div'>\
        <div class='timer-hours-div'><span class='timer-hours'></span></div><span>:</span>\
        <div class='timer-mins-div'><span class='timer-mins'></span></div><span>:</span>\
        <div class='timer-secs-div'><span class='timer-secs'></span></div>\
      </div></td>\
      <td class='auto-reset-cell'><label><input type='checkbox' class='auto-reset-timer' checked><small> Auto Reset</small></label></td>\
      <td class='timer-btns'>\
        <a class='btn btn-primary btn-sm btn-start-timer' id='btn-start-timer" + timerID + "'>Start</a>\
        <a class='btn btn-primary btn-sm btn-pause-timer' id='btn-pause-timer" + timerID + "'>Pause</a>\
        <a class='btn btn-primary btn-sm btn-reset-timer' id='btn-reset-timer" + timerID + "'>Reset</a>\
        <a class='btn btn-danger btn-sm btn-del-timer' id='btn-del-timer" + timerID + "'>Delete</a>\
      </td>\
      <td><select class='trigger-type-timer'>\
        <option value='0'>No Trigger</option>\
        <option value='1'>will start</option>\
        <option value='2'>will pause</option>\
        <option value='3'>will reset</option>\
      </select></td>\
      <td><select class='trigger-opts-timer' id='trigger-opts-timer" + timerID + "' disabled></select></td>\
    </tr>");

  // Timer edit popup
  $("body").append("\
    <div class='name-popup popup' id='name-popup" + timerID + "'>\
      <input type='text' placeholder='timer name' class='form-control name-field'>\
      <a class='btn btn-small btn-primary confirm-name-edit'>OK</a>\
      <a class='btn btn-small btn-primary cancel-name-edit'>Cancel</a>\
    </div>\
    <div class='timer-popup popup' id='timer-popup" + timerID + "'>\
      <div class='timer-fields'>\
        <input pattern='[0-9]*' placeholder='hours' name='hours' class='form-control hours-field'>\
        <input pattern='[0-9]*' placeholder='mins' maxlength='2' name='minutes' class='form-control mins-field'>\
        <input pattern='[0-9]*' placeholder='secs' maxlength='2' name='seconds' class='form-control secs-field'>\
      </div>\
      <a class='btn btn-small btn-primary confirm-timer-edit'>OK</a>\
      <a class='btn btn-small btn-primary cancel-timer-edit'>Cancel</a>\
    </div>\
    ");

  // Create new timer object and add to timer dict
  var timer = new Timer(cdLength, timerID, timerName);
  timers[timerID] = timer;
  groups[groupID].push(timer);

  // Add start all button if number of timers in group is > 1
  if (ggparent.find('.timer-row').length == 2) {
    ggparent.append("\
      <div class='group-btns' id='group-btns" + groupID + "'>\
        <a class='btn btn-primary btn-sm btn-start-group' id='btn-start-group" + groupID + "'>Start All</a>\
        <a class='btn btn-primary btn-sm btn-pause-group' id='btn-pause-group" + groupID + "'>Pause All</a>\
        <a class='btn btn-primary btn-sm btn-reset-group' id='btn-reset-group" + groupID + "'>Reset All</a>\
        <a class='btn btn-danger btn-sm btn-clear-group' id='btn-clear-group" + groupID + "'>Delete All</a>\
      </div>");
  }

  refreshAllTriggers();
  relocateVisibleTimerPopups();
  relocateVisibleNamePopups();
}

function addGroup() {
  var groupID = 0;
  var groupIDs = Object.keys(groups);
  while (groupIDs.indexOf(String(groupID)) > -1) {
    groupID++;
  }
  $(this).parent().append("\
    <div class='timer-group' id='timer-group" + groupID + "'>\
      <form class='navbar-form'>\
        <div class='form-group'>\
          <h2 class='group-name'>Group " + (groupID + 1) + "</h2>\
          <span><input type='text' placeholder='timer name' class='form-control name-field'></span>\
          <span class='timer-fields'>\
          <input pattern='[0-9]*' placeholder='hours' name='hours' class='form-control hours-field'>\
          <input pattern='[0-9]*' placeholder='mins' maxlength='2' name='minutes' class='form-control mins-field'>\
          <input pattern='[0-9]*' placeholder='secs' maxlength='2' name='seconds' class='form-control secs-field'>\
          </span>\
          <a class='btn btn-primary btn-sm btn-add-timer'>Add Timer</a>\
          <a class='btn btn-danger btn-sm btn-del-group'>Delete Group</a>\
        </div>\
      </form>\
      <table class='table'>\
        <tbody></tbody>\
      </table>\
    </div>");
  groups[groupID] = new Array();
}

// Gets the timer ID for the timer buttons
function getButtonTimerID(element, elementClass) {
  var btnID = element.prop('id');
  return btnID.substring(elementClass.length);
}

// Gets an array of timer ID numbers for a group of timers
// This is used for the All buttons (not the delete group)
function getGroupTimerIDs(element) {
  var timerElementIDs = element.parents().eq(1).find('.timer');
  var timerIDs = new Array();
  $.each(timerElementIDs, function() {
    var timerID = this.getAttribute('id').substring('timer'.length);
    timerIDs.push(timerID);
  });
  return timerIDs;
}

function deleteTimer(timer) {
  var timerID = timer.timerID;
  $('#timer-popup' + timerID).remove();
  $('#name-popup' + timerID).remove();

  var groupElement = $('#timer-row' + timerID).parents().eq(2);
  var groupID = groupElement.prop('id').substring('timer-group'.length);

  timer.timerRow.remove();
  delete timers[timerID];

  // Remove the timer from the array of timers in the group dict
  $.each(groups[groupID], function() {
    if (this.timerID == timerID) {
      groups[groupID].splice(groups[groupID].indexOf(this), 1);
    }
  })

  // Remove the group buttons if <= 1 timer remains after deletion
  if (groups[groupID].length <= 1) {
    $('#group-btns' + groupID).remove();
  }
}


// INDIVIDUAL TIMERS
// Add timer
$('.jumbotron').on('click', '.btn-add-timer', addTimer);

// Start timer
$('.jumbotron').on('click', '.btn-start-timer', function() {
  var timerID = getButtonTimerID($(this), 'btn-start-timer');
  timers[timerID].startTimer();
});

// Pause timer
$('.jumbotron').on('click', '.btn-pause-timer', function() {
  var timerID = getButtonTimerID($(this), 'btn-pause-timer');
  timers[timerID].pauseTimer();
});

// Reset timer
$('.jumbotron').on('click', '.btn-reset-timer', function() {
  var timerID = getButtonTimerID($(this), 'btn-reset-timer');
  timers[timerID].resetTimer();
});

// Delete timer
$('.jumbotron').on('click', '.btn-del-timer', function() {
  var timerID = getButtonTimerID($(this), 'btn-del-timer');
  clearInterval(timers[timerID].counter);
  deleteTimer(timers[timerID]);
  refreshAllTriggers();
  relocateVisibleTimerPopups();
  relocateVisibleNamePopups();
});

// GROUP TIMERS
// Add group
$('.add_group').click(addGroup);

// Start all timers in group
$('.jumbotron').on('click', '.btn-start-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function() {
    timers[this].startTimer();
  });
}); 

// Pause all timers in group
$('.jumbotron').on('click', '.btn-pause-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function() {
    timers[this].pauseTimer();
  });
}); 

// Reset all timers in group
$('.jumbotron').on('click', '.btn-reset-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function() {
    timers[this].resetTimer();
  });
});

// Delete all timers in group
$('.jumbotron').on('click', '.btn-clear-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function() {
    clearInterval(timers[this].counter);
    deleteTimer(timers[this]);
  });
  refreshAllTriggers();
  relocateVisibleTimerPopups();
  relocateVisibleNamePopups();
});

// Remove group of timers
$('.jumbotron').on('click', '.btn-del-group', function() {
  var groupElement = $(this).parents().eq(2);
  var groupElementID = groupElement.prop('id');
  var timerObjects = groupElement.find('.timer');
  $.each(timerObjects, function() {
    timerID = this.getAttribute('id').substring('timer'.length);
    clearInterval(timers[timerID].counter);
    deleteTimer(timers[timerID]);
  });
  groupElement.remove();
  delete groups[groupElementID.substring('timer-group'.length)];
  refreshAllTriggers();
  relocateVisibleTimerPopups();
  relocateVisibleNamePopups();
});

// Enable/disable trigger options depending on trigger type
$('.jumbotron').on('change', '.trigger-type-timer', function(){
  if ($(':selected', $(this)).val() == 0) {
    $(this).parents().eq(1).find('.trigger-opts-timer').prop('disabled', true);
  }
  else {
    $(this).parents().eq(1).find('.trigger-opts-timer').prop('disabled', false);
  }
});


// Edit timer length
$('.jumbotron').on({
  click : function() {
    timerElementID = $(this).prop('id');
    timerID = timerElementID.substring('timer'.length);
    $('#name-popup' + timerID + ' .cancel-name-edit').click();
    $('#timer-popup' + timerID).slideDown('fast');
    relocateVisibleTimerPopups();


  }
}, '.timer');

$('body').on('click', '.confirm-timer-edit', function() {
  var parent = $(this).parent();
  var cdLength = getTimerLength(parent);
  if (!checkCDLength(cdLength, parent.find('.timer-fields'))) {
    return;
  }
  // Clear timer entry fields
  clearFields(getTimerFields(parent));

  var timerElementID = parent.prop('id');
  var timerID = timerElementID.substring('timer-popup'.length);
  var timer = timers[timerID];
  if (typeof cdLength == 'number') {
    timer.changeTime(cdLength);
    timer.getTimerText();
  }
  parent.hide();
});

$('body').on('click', '.cancel-timer-edit', function() {
  var parent = $(this).parent();
  parent.find('.timer-fields').removeClass('has-error');
  clearFields(getTimerFields(parent));
  parent.hide();
});

// Edit name of timer
$('.jumbotron').on({
  click : function() {
    timerElementID = $(this).parent().prop('id');
    timerID = timerElementID.substring('timer-row'.length);
    $('#timer-popup' + timerID + ' .cancel-timer-edit').click();
    $('#name-popup' + timerID).slideDown('fast');
    relocateVisibleNamePopups();
  }
}, '.timer-name-cell');

$('body').on('click', '.confirm-name-edit', function() {
  var parent = $(this).parent();
  var nameField = parent.find('.name-field');
  var timerName = nameField.val();

  if (timerName == '' || timerName == null) {
    nameField.parent().addClass('has-error');
    return;
  }
  else {
    nameField.parent().removeClass('has-error');
  }

  var timerElementID = parent.prop('id');
  var timerID = timerElementID.substring('name-popup'.length);
  var timer = timers[timerID];
  timer.timerName = timerName;
  $('#timer-row' + timerID).find('.timer-name').html(timerName);

  nameField.val('');
  refreshAllTriggers();
  parent.hide();
});

$('body').on('click', '.cancel-name-edit', function() {
  var parent = $(this).parent();
  var nameField = parent.find('.name-field');
  parent.removeClass('has-error');
  nameField.val('');
  parent.hide();
});