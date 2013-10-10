var timers = {};
var groups = {};

function addTriggers(timerID) {
  $("#trigger-opts-timer" + timerID).html('');
  var triggersStr = '<option selected disabled value="default">Select Timer</option>';
  $.each(Object.keys(groups), function(key){
    triggersStr = triggersStr.concat("<optgroup label='Group " + (key + 1) + "'>");
    var timersArray = groups[key];
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

function refreshTriggers(timerID) {
  var triggerOpts = $('#timer-row' + timerID).find('.trigger-opts-timer');
  var selectedTriggerOpt = $('#timer-row' + timerID).find('.trigger-opts-timer :selected');
  addTriggers(timerID);
  if (Object.keys(timers).indexOf(selectedTriggerOpt.val()) > -1) {
    $(triggerOpts).val(selectedTriggerOpt.text());
  }
}

function addTimer() {
  var parent = $(this).parent();
  var ggparent = parent.parents().eq(1);
  var groupID = parent.find('h2').html().substring('Group '.length) - 1;

  var nameField = parent.find('.name-field');
  var hoursField = parent.find('.hours-field');
  var minsField = parent.find('.mins-field');
  var secsField = parent.find('.secs-field');

  // Get length of timer in seconds
  var hours = hoursField.val();
  var mins = minsField.val();
  var secs = secsField.val();
  var cdLength = hours * 3600 + mins * 60 + secs / 1;

  var timerName = nameField.val();

  // Make sure timer fields aren't empty
  if (cdLength <= 0 || (hoursField.val() == '' && minsField.val() == '' && secsField.val() == '')) {
    return;
  }

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
      <td>" + timerName + "</td>\
      <td class='timer' id='timer" + timerID + "'></td>\
      <td><label><input type='checkbox' class='auto-reset-timer' checked><small> Auto Reset</small></label></td>\
      <td>\
        <a class='btn btn-primary btn-sm btn-start-timer' id='btn-start-timer" + timerID + "'>Start</a>\
        <a class='btn btn-primary btn-sm btn-pause-timer' id='btn-pause-timer" + timerID + "'>Pause</a>\
        <a class='btn btn-primary btn-sm btn-reset-timer' id='btn-reset-timer" + timerID + "'>Reset</a>\
        <a class='btn btn-danger btn-sm btn-del-timer' id='btn-del-timer" + timerID + "'>Delete</a>\
      </td>\
      <td><select class='form-control trigger-type-timer'>\
        <option value='0'>No Trigger</option>\
        <option value='1'>will trigger</option>\
        <option value='2'>is triggered by</option>\
      </select></td>\
      <td><select class='form-control trigger-opts-timer' id='trigger-opts-timer" + timerID + "' disabled></select></td>\
    </tr>");

  // Create new timer object and add to timer dict
  var timer = new Timer(cdLength, timerID, timerName, groupID);
  timers[timerID] = timer;
  groups[groupID].push(timer);

  // Get trigger options
  $.each(Object.keys(timers), function(key) {
    addTriggers(key);
  });

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

  // Clear timer entry fields
  nameField.val('');
  hoursField.val('');
  minsField.val('');
  secsField.val('');
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
          <h2>Group " + (groupID + 1) + "</h2>\
          <input type='text' placeholder='timer name (optional)' class='form-control name-field'>\
          <input type='number' placeholder='hours' min='0' name='hours' class='form-control hours-field'>\
          <input type='number' placeholder='mins' min='0' max='59' name='minutes' class='form-control mins-field'>\
          <input type='number' placeholder='secs' min='0' max='59' name='seconds' class='form-control secs-field'>\
          <a class='btn btn-primary btn-sm btn-add-timer'>Add Timer</a>\
          <a class='btn btn-danger btn-sm btn-del-group'>Delete Group</a>\
        </div>\
      </form>\
      <table class='table'><tbody></tbody></table>\
    </div>");
  groups[groupID] = new Array();
}

// Gets the timer ID for the timer buttons
function getButtonTimerID(element, elementClass) {
  var btnID = element.attr('id');
  return btnID.substring(elementClass.length);
}

// Gets an array of timer ID numbers for a group of timers
// This is used for the All buttons (not the delete group)
function getGroupTimerIDs(element) {
  var timerElementIDs = element.parents().eq(1).find('.timer');
  var timerIDs = new Array();
  $.each(timerElementIDs, function() {
    var timerID = element.attr('id').substring('timer'.length);
    timerIDs.push(timerID);
  });
  return timerIDs;
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
  timers[timerID].deleteTimer();
});

// GROUP TIMERS
// Add group
$('.add_group').click(addGroup);

// Start all timers in group
$('.jumbotron').on('click', '.btn-start-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function(timerID) {
    timers[timerID].startTimer();
  });
}); 

// Pause all timers in group
$('.jumbotron').on('click', '.btn-pause-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function(timerID) {
    timers[timerID].pauseTimer();
  });
}); 

// Reset all timers in group
$('.jumbotron').on('click', '.btn-reset-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function(timerID) {
    timers[timerID].resetTimer();
  });
});

// Delete all timers in group
$('.jumbotron').on('click', '.btn-clear-group', function() {
  var timerIDs = getGroupTimerIDs($(this));
  $.each(timerIDs, function(timerID) {
    clearInterval(timers[timerID].counter);
    timers[timerID].deleteTimer();
  });
});

// Remove group of timers
$('.jumbotron').on('click', '.btn-del-group', function() {
  var groupElementID = $(this).parents().eq(2).attr('id');
  var timerIDs = $('#' + groupElementID).find('.timer');
  $.each(timerIDs, function() {
    var timerID = $(this).attr('id').substring('timer'.length);
    clearInterval(timers[timerID].counter);
    timers[timerID].deleteTimer();
  });
  $('#' + groupElementID).remove();
  delete groups[groupElementID.substring('timer-group'.length)];
});

// Enable/disable trigger options depending on trigger type
$('.jumbotron').on('change', '.trigger-type-timer', function(){
  if ($(':selected', $(this)).val() == 0) {
    $(this).parents().eq(1).find('.trigger-opts-timer').prop('disabled', 'disabled');
  }
  else {
    $(this).parents().eq(1).find('.trigger-opts-timer').prop('disabled', false);
  }
});
