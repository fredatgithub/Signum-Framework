using System.ComponentModel;

namespace Signum.Entities.Authorization;

[AllowUnathenticated]
public enum LoginAuthMessage
{
    [Description("The password must have at least {0} characters")]
    ThePasswordMustHaveAtLeast0Characters,
    NotUserLogged,

    [Description("Username {0} is not valid")]
    Username0IsNotValid,

    [Description("User {0} is disabled")]
    User0IsDisabled,

    IncorrectPassword,

    Login,
    MyProfile,
    Password,
    ChangePassword,
    SwitchUser,
    [Description("Logout")]
    Logout,
    EnterYourUserNameAndPassword,
    Username,
    [Description("E-Mail Address")]
    EMailAddress,
    [Description("E-Mail Address or Username")]
    EmailAddressOrUsername,
    RememberMe,
    IHaveForgottenMyPassword,

    [Description("Show login form")]
    ShowLoginForm,

    [Description("Login with Windows user")]
    LoginWithWindowsUser,
    [Description("No Windows user found")]
    NoWindowsUserFound,
    [Description("Looks like you windows user is not allowed to use this application, the browser is not providing identity information, or the server is not properly configured.")]
    LooksLikeYourWindowsUserIsNotAllowedToUseThisApplication,

    [Description("I forgot my password")]
    IForgotMyPassword,
    EnterYourUserEmail,
    SendEmail,
    [Description("Give us your user's email and we will send you an email so you can reset your password.")]
    GiveUsYourUserEmailToResetYourPassword,
    RequestAccepted,
    [Description("The password must have a value")]
    PasswordMustHaveAValue,
    PasswordsAreDifferent,
    PasswordChanged,
    [Description("The password has been changed successfully")]
    PasswordHasBeenChangedSuccessfully,
    [Description("New password")]
    NewPassword,
    EnterTheNewPassword,
    ConfirmNewPassword,
    [Description("Enter your current password and the new one")]
    EnterActualPasswordAndNewOne,
    [Description("Current password")]
    CurrentPassword,

    [Description("We have sent you an email with a link that will allow you to reset your password.")]
    WeHaveSentYouAnEmailToResetYourPassword,

    [Description("The user name must have a value")]
    UserNameMustHaveAValue,
    InvalidUsernameOrPassword,
    InvalidUsername,
    InvalidPassword,

    [Description("An error occurred, request not processed.")]
    AnErrorOccurredRequestNotProcessed,

    TheUserIsNotLongerInTheDatabase,

    [Description("Register {0}")]
    Register0,

    [Description("Success")]
    Success,

    [Description("{0} has been successfully associated with user {1} in this device.")]
    _0HasBeenSucessfullyAssociatedWithUser1InThisDevice,

    [Description("Try to log-in with it!")]
    TryToLogInWithIt,

    [Description("Login with {0}")]
    LoginWith0,
}

public enum AuthMessage
{
    [Description("Not authorized to {0} the {1} with Id {2}")]
    NotAuthorizedTo0The1WithId2,
    [Description("Not authorized to retrieve '{0}'")]
    NotAuthorizedToRetrieve0
}

public enum AuthEmailMessage
{
    [Description("You recently requested a new password")]
    YouRecentlyRequestedANewPassword,
    [Description("Your username is:")]
    YourUsernameIs,
    [Description("You can reset your password by following the link below")]
    YouCanResetYourPasswordByFollowingTheLinkBelow,
    [Description("Reset password request")]
    ResetPasswordRequestSubject,
    [Description("Your reset password request has expired")]
    YourResetPasswordRequestHasExpired,
    [Description("We have send you an email to reset your password")]
    WeHaveSendYouAnEmailToResetYourPassword,
    [Description("Email not found")]
    EmailNotFound,
    [Description("Your account has been locked due to several failed logins")]
    YourAccountHasBeenLockedDueToSeveralFailedLogins,
    [Description("Your account has been locked")]
    YourAccountHasBeenLocked,
}
