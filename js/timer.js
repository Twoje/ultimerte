function Timer(time, timerID, timerName, groupID) {
  this.count = time;
  this.isTicking = false;
  this.timerName = timerName;
  this.timerID = timerID;
  this.groupID = groupID;
  this.timerElement = $('#timer' + timerID);
  this.timerHours = this.timerElement.find('.timer-hours');
  this.timerMins = this.timerElement.find('.timer-mins');
  this.timerSecs = this.timerElement.find('.timer-secs');
  this.timerRow = $('#timer-row' + timerID);

  this.changeTime = function() {
    time = this.count;
  }

  // Create leading zero for numbers < 10
  function pad(t) {
    return (t < 10) ? ('0' + t) : t;
  }

  var _this = this;

  // Get clock text for timer
  this.getTimerText = function() {
    var hours = Math.floor(this.count / 3600);
    var mins = Math.floor((this.count % 3600) / 60);
    var secs = this.count % 60;

    this.timerHours.html(pad(hours));
    this.timerMins.html(pad(mins));
    this.timerSecs.html(pad(secs));
  }

  this.getTimerText();

  // Count down the clock
  this.countdown = function()
  {
    if (this.count > 0) {
      this.count = this.count - 1;
      this.getTimerText();
    }
    if (this.count <= 0)
    {
      // Probably unneccessary, but just in case this.count < 0
      this.count = 0; // Set this.count to 0
      this.getTimerText(); // Refresh inner HTML

      // This is where a notification (sound or screen flash or something) should go
      this.timerElement.css('color','red');
      this.timerRow.removeClass('warning').removeClass('success').addClass('danger');
      this.timerRow.find('.sfx-ding').get(0).play();

      // Reset timer if auto reset box checked
      if (this.timerRow.find('.auto-reset-timer:checked').length > 0) {
        setTimeout(function(){return;}, 1000);
        this.resetTimer();
      }

      clearInterval(this.counter);

      // Triggers
      var thisTriggerType = this.timerRow.find('.trigger-type-timer :selected');

      // Will Trigger
      if (thisTriggerType.val() == 1) {
        var thisTriggerOpt = this.timerRow.find('.trigger-opts-timer :selected');
        if (thisTriggerOpt.val() != 'default') {
          timers[thisTriggerOpt.val()].startTimer();
        }
      }

      // Is Triggered By
      $.each($('.timer-row'), function() {
        var thisTimerElementID = $(this).find('.timer').prop('id');
        var thisTimerID = thisTimerElementID.substring('timer'.length);

        var triggerType = $(this).find('.trigger-type-timer :selected');
        if (thisTimerID == _this.timerID || triggerType.val() == 1) {
          return true;
        }

        var triggerOpt = $(this).find('.trigger-opts-timer :selected').text();
        if ((triggerType.val() == 2) && (triggerOpt == _this.timerName)) {
          timers[thisTimerID].startTimer();
        }

      });

      return;
    }
  }

  // Start the timer
  this.startTimer = function() {
    if (this.isTicking == false) {
      this.isTicking = true;
      this.timerElement.css('color','green');
      this.timerRow.removeClass('warning').removeClass('danger').addClass('success');
      this.counter = setInterval(function(){_this.countdown();}, 1000);
    }
  }

  // Pause the timer
  this.pauseTimer = function() {
    if (this.isTicking == true) {
      clearInterval(this.counter);
      this.isTicking = false;
      this.timerElement.css('color','orange');
      this.timerRow.removeClass('success').removeClass('danger').addClass('warning');
    }
  }

  // Reset the timer
  this.resetTimer = function() {
    clearInterval(this.counter);
    this.isTicking = false;
    this.count = time;
    this.getTimerText();
    this.timerElement.css('color','black');
    this.timerRow.removeClass('warning').removeClass('danger').removeClass('success');
  }

  // Delete the timer
  this.deleteTimer = function() {
    delete timers[timerID];
    this.timerRow.remove();

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
    refreshAllTriggers();
  }
}
